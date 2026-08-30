-- ==============================================================================
-- CAMPUSLOOP — ALL-IN-ONE SUPABASE SETUP SCRIPT (PRODUCTION READY)
-- Paste this entire script into your Supabase SQL Editor and click "Run".
-- It creates all tables, enables RLS, sets security policies, creates the auth trigger,
-- and inserts seed data.
-- ==============================================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- Drop existing tables if re-running from scratch
drop table if exists rent_splits cascade;
drop table if exists messages cascade;
drop table if exists conversation_members cascade;
drop table if exists conversations cascade;
drop table if exists roommate_profiles cascade;
drop table if exists listing_images cascade;
drop table if exists wanted_listings cascade;
drop table if exists listings cascade;
drop table if exists rooms cascade;
drop table if exists users cascade;
drop table if exists campuses cascade;

-- 1. Campuses
create table campuses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  created_at timestamptz not null default now()
);

-- 2. Users (Student Profiles)
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  campus_id uuid not null references campuses(id) on delete cascade,
  avatar text,
  monthly_income numeric,
  created_at timestamptz not null default now()
);

-- Trigger to automatically create a public.users row when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, campus_id, avatar, monthly_income)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    '00000000-0000-0000-0000-000000000001',
    null,
    null
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Listings (Marketplace Items)
create table listings (
  id text primary key,
  seller_id uuid not null references users(id) on delete cascade,
  campus_id uuid not null references campuses(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  type text not null check (type in ('buy', 'sell', 'rent')),
  price numeric not null,
  condition text not null,
  location_label text not null,
  status text not null default 'active' check (status in ('active', 'sold', 'archived')),
  created_at timestamptz not null default now()
);

-- 3b. Wanted Listings (Reverse Marketplace / Buyer Requests)
create table wanted_listings (
  id text primary key,
  requester_id uuid not null references users(id) on delete cascade,
  campus_id uuid not null references campuses(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  budget_max numeric not null,
  status text not null default 'active' check (status in ('active', 'fulfilled', 'archived')),
  created_at timestamptz not null default now()
);

-- 4. Listing Images
create table listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null references listings(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- 5. Rooms (Housing & PG Listings)
create table rooms (
  id text primary key,
  owner_id uuid not null references users(id) on delete cascade,
  campus_id uuid not null references campuses(id) on delete cascade,
  title text not null,
  rent numeric not null,
  utilities numeric not null default 0,
  maintenance numeric not null default 0,
  bedrooms integer not null default 1,
  occupancy_total integer not null default 1,
  occupancy_filled integer not null default 0,
  amenities text[] not null default '{}',
  location_label text not null,
  available_from text not null,
  status text not null default 'available' check (status in ('available', 'occupied', 'archived')),
  created_at timestamptz not null default now()
);

-- 6. Roommate Profiles (Finder Filter Data)
create table roommate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  budget_min numeric not null,
  budget_max numeric not null,
  preferred_location text not null,
  move_in_month text not null,
  lifestyle_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 7. Conversations (Single Unified Chat Table)
create table conversations (
  id text primary key,
  listing_id text references listings(id) on delete set null,
  room_id text references rooms(id) on delete set null,
  wanted_listing_id text references wanted_listings(id) on delete set null,
  type text not null check (type in ('marketplace_dm', 'housing_group', 'roommate_dm', 'wanted_response')),
  created_at timestamptz not null default now()
);

create unique index if not exists uniq_housing_group_per_room on conversations(room_id) where type = 'housing_group' and room_id is not null;

-- 8. Conversation Members
create table conversation_members (
  conversation_id text not null references conversations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('seller', 'buyer', 'owner', 'prospective_roommate')),
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

-- 9. Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 10. Rent Splits (Calculation Snapshots & Standalone Splits)
create table rent_splits (
  id text primary key,
  room_id text references rooms(id) on delete set null,
  user_id uuid references users(id) on delete cascade,
  total_rent numeric not null,
  utilities numeric not null default 0,
  maintenance numeric not null default 0,
  occupants integer not null default 1,
  per_person_share numeric not null,
  income_used numeric,
  housing_ratio_pct numeric,
  flag_level text check (flag_level in ('comfortable', 'moderate', 'high', 'heavy')),
  created_at timestamptz not null default now()
);

-- Indexes for performant filtering & chat lookups
create index if not exists idx_listings_campus on listings(campus_id);
create index if not exists idx_listings_category on listings(category);
create index if not exists idx_listings_type on listings(type);
create index if not exists idx_wanted_listings_campus on wanted_listings(campus_id);
create index if not exists idx_wanted_listings_category on wanted_listings(category);
create index if not exists idx_wanted_listings_requester on wanted_listings(requester_id);
create index if not exists idx_rooms_campus on rooms(campus_id);
create index if not exists idx_roommate_profiles_user on roommate_profiles(user_id);
create index if not exists idx_messages_conversation on messages(conversation_id, created_at asc);
create index if not exists idx_conv_members_user on conversation_members(user_id);
create index if not exists idx_conv_listing on conversations(listing_id);
create index if not exists idx_conv_room on conversations(room_id);
create index if not exists idx_conv_wanted_listing on conversations(wanted_listing_id);

-- Enable RLS on all tables
alter table campuses enable row level security;
alter table users enable row level security;
alter table listings enable row level security;
alter table wanted_listings enable row level security;
alter table listing_images enable row level security;
alter table rooms enable row level security;
alter table roommate_profiles enable row level security;
alter table conversations enable row level security;
alter table conversation_members enable row level security;
alter table messages enable row level security;
alter table rent_splits enable row level security;

-- Campuses Policies
create policy "Campuses are viewable by everyone" on campuses for select using (true);

-- Users Policies
create policy "Users are viewable by authenticated users" on users for select using (true);
create policy "Users can insert their own profile" on users for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on users for update using (auth.uid() = id) with check (auth.uid() = id);

-- Listings Policies
create policy "Listings are viewable by everyone" on listings for select using (true);
create policy "Listing images are viewable by everyone" on listing_images for select using (true);
create policy "Authenticated users can create listings" on listings for insert with check (auth.uid() = seller_id);
create policy "Sellers can update their own listings" on listings for update using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create policy "Sellers can delete their own listings" on listings for delete using (auth.uid() = seller_id);
create policy "Sellers can manage listing images" on listing_images for all using (exists (select 1 from listings where listings.id = listing_images.listing_id and listings.seller_id = auth.uid()));

-- Wanted Listings Policies
create policy "Wanted listings are viewable by everyone" on wanted_listings for select using (true);
create policy "Authenticated users can create wanted listings" on wanted_listings for insert with check (auth.uid() = requester_id);
create policy "Requesters can update their own wanted listings" on wanted_listings for update using (auth.uid() = requester_id) with check (auth.uid() = requester_id);
create policy "Requesters can delete their own wanted listings" on wanted_listings for delete using (auth.uid() = requester_id);

-- Rooms Policies
create policy "Rooms are viewable by everyone" on rooms for select using (true);
create policy "Authenticated users can create room listings" on rooms for insert with check (auth.uid() = owner_id);
create policy "Owners can update their own room listings" on rooms for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Owners can delete their own room listings" on rooms for delete using (auth.uid() = owner_id);

-- Roommate Profiles Policies
create policy "Roommate profiles are viewable by everyone" on roommate_profiles for select using (true);
create policy "Users can create their own roommate profile" on roommate_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update their own roommate profile" on roommate_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own roommate profile" on roommate_profiles for delete using (auth.uid() = user_id);

-- Conversations & Members Policies
create policy "Members can view their conversations" on conversations for select using (exists (select 1 from conversation_members where conversation_members.conversation_id = conversations.id and conversation_members.user_id = auth.uid()));
create policy "Authenticated users can create conversations" on conversations for insert with check (true);
create policy "Members can view conversation members" on conversation_members for select using (exists (select 1 from conversation_members cm where cm.conversation_id = conversation_members.conversation_id and cm.user_id = auth.uid()));
create policy "Authenticated users can add conversation members" on conversation_members for insert with check (true);

-- Messages Policies
create policy "Members can view messages in their conversations" on messages for select using (exists (select 1 from conversation_members where conversation_members.conversation_id = messages.conversation_id and conversation_members.user_id = auth.uid()));
create policy "Members can insert messages" on messages for insert with check (auth.uid() = sender_id and exists (select 1 from conversation_members where conversation_members.conversation_id = messages.conversation_id and conversation_members.user_id = auth.uid()));

-- Rent Splits Policies
create policy "Rent splits are viewable by everyone" on rent_splits for select using (true);
create policy "Authenticated users can save rent splits" on rent_splits for insert with check (auth.uid() = user_id);
