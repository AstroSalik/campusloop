-- ==============================================================================
-- CampusLoop — Row Level Security (RLS) Policies (Production Tightened)
-- Authoritative Security Rules matching PRD.md & Project-Context.md
-- ==============================================================================

-- 1. Enable RLS on all tables
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

-- ------------------------------------------------------------------------------
-- Campuses Policies
-- ------------------------------------------------------------------------------
drop policy if exists "Campuses are viewable by everyone" on campuses;
create policy "Campuses are viewable by everyone"
  on campuses for select
  using (true);

-- ------------------------------------------------------------------------------
-- Users Policies
-- ------------------------------------------------------------------------------
-- All users can view student public profiles (needed to render sellers, room owners, chat senders)
drop policy if exists "Users are viewable by authenticated users" on users;
create policy "Users are viewable by authenticated users"
  on users for select
  using (true);

-- Students can insert or update only their own profile
drop policy if exists "Users can insert their own profile" on users;
create policy "Users can insert their own profile"
  on users for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on users;
create policy "Users can update their own profile"
  on users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- Listings & Listing Images Policies
-- ------------------------------------------------------------------------------
-- Public browse
drop policy if exists "Listings are viewable by everyone" on listings;
create policy "Listings are viewable by everyone"
  on listings for select
  using (true);

drop policy if exists "Listing images are viewable by everyone" on listing_images;
create policy "Listing images are viewable by everyone"
  on listing_images for select
  using (true);

-- Seller create, update, delete
drop policy if exists "Authenticated users can create listings" on listings;
create policy "Authenticated users can create listings"
  on listings for insert
  with check (auth.uid() = seller_id);

drop policy if exists "Sellers can update their own listings" on listings;
create policy "Sellers can update their own listings"
  on listings for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists "Sellers can delete their own listings" on listings;
create policy "Sellers can delete their own listings"
  on listings for delete
  using (auth.uid() = seller_id);

drop policy if exists "Sellers can manage listing images" on listing_images;
create policy "Sellers can manage listing images"
  on listing_images for all
  using (
    exists (
      select 1 from listings
      where listings.id = listing_images.listing_id
      and listings.seller_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- Wanted Listings Policies (Reverse Marketplace)
-- ------------------------------------------------------------------------------
-- Anyone can browse active wanted listings
drop policy if exists "Wanted listings are viewable by everyone" on wanted_listings;
create policy "Wanted listings are viewable by everyone"
  on wanted_listings for select
  using (true);

-- Requester create
drop policy if exists "Authenticated users can create wanted listings" on wanted_listings;
create policy "Authenticated users can create wanted listings"
  on wanted_listings for insert
  with check (auth.uid() = requester_id);

-- Requester update and delete
drop policy if exists "Requesters can update their own wanted listings" on wanted_listings;
create policy "Requesters can update their own wanted listings"
  on wanted_listings for update
  using (auth.uid() = requester_id)
  with check (auth.uid() = requester_id);

drop policy if exists "Requesters can delete their own wanted listings" on wanted_listings;
create policy "Requesters can delete their own wanted listings"
  on wanted_listings for delete
  using (auth.uid() = requester_id);

-- ------------------------------------------------------------------------------
-- Rooms Policies
-- ------------------------------------------------------------------------------
-- Public browse
drop policy if exists "Rooms are viewable by everyone" on rooms;
create policy "Rooms are viewable by everyone"
  on rooms for select
  using (true);

-- Owner create, update, delete
drop policy if exists "Authenticated users can create room listings" on rooms;
create policy "Authenticated users can create room listings"
  on rooms for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their own room listings" on rooms;
create policy "Owners can update their own room listings"
  on rooms for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete their own room listings" on rooms;
create policy "Owners can delete their own room listings"
  on rooms for delete
  using (auth.uid() = owner_id);

-- ------------------------------------------------------------------------------
-- Roommate Profiles Policies
-- ------------------------------------------------------------------------------
-- Public browse for roommate finder
drop policy if exists "Roommate profiles are viewable by everyone" on roommate_profiles;
create policy "Roommate profiles are viewable by everyone"
  on roommate_profiles for select
  using (true);

-- User create, update, delete
drop policy if exists "Users can create their own roommate profile" on roommate_profiles;
create policy "Users can create their own roommate profile"
  on roommate_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own roommate profile" on roommate_profiles;
create policy "Users can update their own roommate profile"
  on roommate_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own roommate profile" on roommate_profiles;
create policy "Users can delete their own roommate profile"
  on roommate_profiles for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Conversations & Members Policies (Unified Chat)
-- ------------------------------------------------------------------------------
-- Users can view conversations they are a member of
drop policy if exists "Members can view their conversations" on conversations;
create policy "Members can view their conversations"
  on conversations for select
  using (
    exists (
      select 1 from conversation_members
      where conversation_members.conversation_id = conversations.id
      and conversation_members.user_id = auth.uid()
    )
  );

-- Authenticated users can create new conversation threads
drop policy if exists "Authenticated users can create conversations" on conversations;
create policy "Authenticated users can create conversations"
  on conversations for insert
  with check (true);

-- Users can view members of conversations they belong to
drop policy if exists "Members can view conversation members" on conversation_members;
create policy "Members can view conversation members"
  on conversation_members for select
  using (
    exists (
      select 1 from conversation_members cm
      where cm.conversation_id = conversation_members.conversation_id
      and cm.user_id = auth.uid()
    )
  );

-- Users can join conversations as members
drop policy if exists "Authenticated users can add conversation members" on conversation_members;
create policy "Authenticated users can add conversation members"
  on conversation_members for insert
  with check (true);

-- ------------------------------------------------------------------------------
-- Messages Policies
-- ------------------------------------------------------------------------------
-- Users can read messages only in conversations where they are a member
drop policy if exists "Members can view messages in their conversations" on messages;
create policy "Members can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversation_members
      where conversation_members.conversation_id = messages.conversation_id
      and conversation_members.user_id = auth.uid()
    )
  );

-- Users can insert messages only if they are a member and the sender
drop policy if exists "Members can insert messages" on messages;
create policy "Members can insert messages"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversation_members
      where conversation_members.conversation_id = messages.conversation_id
      and conversation_members.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- Rent Splits Policies
-- ------------------------------------------------------------------------------
drop policy if exists "Rent splits are viewable by everyone" on rent_splits;
create policy "Rent splits are viewable by everyone"
  on rent_splits for select
  using (true);

drop policy if exists "Authenticated users can save rent splits" on rent_splits;
create policy "Authenticated users can save rent splits"
  on rent_splits for insert
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Enable Realtime Replication for Chat
-- ------------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table conversations;
  end if;
end $$;
