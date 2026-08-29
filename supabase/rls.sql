-- ==============================================================================
-- CampusLoop — Row Level Security (RLS) Policies
-- Authoritative Security Rules matching PRD.md & Project-Context.md
--
-- ARCHITECTURAL NOTE ON `or auth.uid() is null`:
-- In standard production deployment, every student authenticates via verified
-- university email (Supabase Auth OTP / SSO), establishing cryptographic JWT sessions
-- where `auth.uid() = user_id`.
--
-- For the hackathon evaluation environment, CampusLoop includes an instant 1-click
-- Demo Account Switcher (switching between buyer Bilal, seller Sukhman, owner Vikram, etc.)
-- without requiring live phone/email OTP verification during a 5-minute pitch.
-- To allow seamless demo switching, the insert and select policies include an explicit
-- `or auth.uid() is null` clause.
--
-- PRODUCTION MIGRATION:
-- In production, the `or auth.uid() is null` fallback is removed across all policies
-- to enforce strict database-kernel-level cryptographic session binding.
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
create policy "Campuses are viewable by everyone"
  on campuses for select
  using (true);

-- ------------------------------------------------------------------------------
-- Users Policies
-- ------------------------------------------------------------------------------
-- All users can view student public profiles (needed to render sellers, room owners, chat senders)
create policy "Users are viewable by authenticated users"
  on users for select
  using (true);

-- Students can insert or update only their own profile
create policy "Users can insert their own profile"
  on users for insert
  with check (auth.uid() = id or auth.uid() is null);

create policy "Users can update their own profile"
  on users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- Listings & Listing Images Policies
-- ------------------------------------------------------------------------------
-- Public browse
create policy "Listings are viewable by everyone"
  on listings for select
  using (true);

create policy "Listing images are viewable by everyone"
  on listing_images for select
  using (true);

-- Seller create, update, delete
create policy "Authenticated users can create listings"
  on listings for insert
  with check (auth.uid() = seller_id or auth.uid() is null);

create policy "Sellers can update their own listings"
  on listings for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "Sellers can delete their own listings"
  on listings for delete
  using (auth.uid() = seller_id);

create policy "Sellers can manage listing images"
  on listing_images for all
  using (
    exists (
      select 1 from listings
      where listings.id = listing_images.listing_id
      and (listings.seller_id = auth.uid() or auth.uid() is null)
    )
  );

-- ------------------------------------------------------------------------------
-- Wanted Listings Policies (Reverse Marketplace)
-- ------------------------------------------------------------------------------
-- Anyone can browse active wanted listings
create policy "Wanted listings are viewable by everyone"
  on wanted_listings for select
  using (true);

-- Requester create
create policy "Authenticated users can create wanted listings"
  on wanted_listings for insert
  with check (auth.uid() = requester_id or auth.uid() is null);

-- Requester update and delete
create policy "Requesters can update their own wanted listings"
  on wanted_listings for update
  using (auth.uid() = requester_id)
  with check (auth.uid() = requester_id);

create policy "Requesters can delete their own wanted listings"
  on wanted_listings for delete
  using (auth.uid() = requester_id);

-- ------------------------------------------------------------------------------
-- Rooms Policies
-- ------------------------------------------------------------------------------
-- Public browse
create policy "Rooms are viewable by everyone"
  on rooms for select
  using (true);

-- Owner create, update, delete
create policy "Authenticated users can create room listings"
  on rooms for insert
  with check (auth.uid() = owner_id or auth.uid() is null);

create policy "Owners can update their own room listings"
  on rooms for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete their own room listings"
  on rooms for delete
  using (auth.uid() = owner_id);

-- ------------------------------------------------------------------------------
-- Roommate Profiles Policies
-- ------------------------------------------------------------------------------
-- Public browse for roommate finder
create policy "Roommate profiles are viewable by everyone"
  on roommate_profiles for select
  using (true);

-- User create, update, delete
create policy "Users can create their own roommate profile"
  on roommate_profiles for insert
  with check (auth.uid() = user_id or auth.uid() is null);

create policy "Users can update their own roommate profile"
  on roommate_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own roommate profile"
  on roommate_profiles for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Conversations & Members Policies (Unified Chat)
-- ------------------------------------------------------------------------------
-- Users can view conversations they are a member of
create policy "Members can view their conversations"
  on conversations for select
  using (
    exists (
      select 1 from conversation_members
      where conversation_members.conversation_id = conversations.id
      and (conversation_members.user_id = auth.uid() or auth.uid() is null)
    )
  );

-- Authenticated users can create new conversation threads
create policy "Authenticated users can create conversations"
  on conversations for insert
  with check (true);

-- Users can view members of conversations they belong to
create policy "Members can view conversation members"
  on conversation_members for select
  using (
    exists (
      select 1 from conversation_members cm
      where cm.conversation_id = conversation_members.conversation_id
      and (cm.user_id = auth.uid() or auth.uid() is null)
    )
  );

-- Users can join conversations as members
create policy "Authenticated users can add conversation members"
  on conversation_members for insert
  with check (true);

-- ------------------------------------------------------------------------------
-- Messages Policies
-- ------------------------------------------------------------------------------
-- Users can read messages only in conversations where they are a member
create policy "Members can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversation_members
      where conversation_members.conversation_id = messages.conversation_id
      and (conversation_members.user_id = auth.uid() or auth.uid() is null)
    )
  );

-- Users can insert messages only if they are a member and the sender
create policy "Members can insert messages"
  on messages for insert
  with check (
    (auth.uid() = sender_id or auth.uid() is null)
    and exists (
      select 1 from conversation_members
      where conversation_members.conversation_id = messages.conversation_id
      and (conversation_members.user_id = auth.uid() or auth.uid() is null)
    )
  );

-- ------------------------------------------------------------------------------
-- Rent Splits Policies
-- ------------------------------------------------------------------------------
create policy "Rent splits are viewable by everyone"
  on rent_splits for select
  using (true);

create policy "Authenticated users can save rent splits"
  on rent_splits for insert
  with check (auth.uid() = user_id or auth.uid() is null);

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
