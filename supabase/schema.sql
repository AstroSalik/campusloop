-- ==============================================================================
-- CampusLoop — Database Schema (DDL)
-- Authoritative Schema matching PRD.md Section 6 & Project-Context.md
-- ==============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "pgcrypto";

-- 1. Campuses
create table if not exists campuses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  created_at timestamptz not null default now()
);

-- 2. Users (Student Profiles)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  campus_id uuid not null references campuses(id) on delete cascade,
  avatar text,
  monthly_income numeric,
  created_at timestamptz not null default now()
);

-- 3. Listings (Marketplace Items)
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
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

-- 4. Listing Images
create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- 5. Rooms (Housing & PG Listings)
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
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
create table if not exists roommate_profiles (
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
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete set null,
  room_id uuid references rooms(id) on delete set null,
  type text not null check (type in ('marketplace_dm', 'housing_group')),
  created_at timestamptz not null default now()
);

-- 8. Conversation Members
create table if not exists conversation_members (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('seller', 'buyer', 'owner', 'prospective_roommate')),
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

-- 9. Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 10. Rent Splits (Calculation Snapshots & Standalone Splits)
create table if not exists rent_splits (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete set null,
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
create index if not exists idx_rooms_campus on rooms(campus_id);
create index if not exists idx_roommate_profiles_user on roommate_profiles(user_id);
create index if not exists idx_messages_conversation on messages(conversation_id, created_at asc);
create index if not exists idx_conv_members_user on conversation_members(user_id);
create index if not exists idx_conv_listing on conversations(listing_id);
create index if not exists idx_conv_room on conversations(room_id);
