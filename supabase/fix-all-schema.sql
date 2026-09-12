-- ==============================================================================
-- CampusLoop — Master Database Fix & Sync Patch
-- Run this in your Supabase Dashboard -> SQL Editor (1-Click Execution)
-- This fixes:
-- 1. Missing public.users columns (campus_name, city, dept, KYC fields, etc.)
-- 2. Missing public.wanted_listings table (reverse marketplace)
-- 3. Enables full RLS policies for smooth reads, authenticated writes, and cascade deletes
-- ==============================================================================

-- 1. Ensure all extended columns exist on public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS campus_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS year_of_study text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS student_id text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_doc_type text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS aadhaar_last4 text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_submitted_at timestamptz;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_verified_at timestamptz;

-- 2. Create wanted_listings table if not present
CREATE TABLE IF NOT EXISTS public.wanted_listings (
  id text PRIMARY KEY,
  requester_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campus_id uuid NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  budget_max numeric NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index wanted_listings for high query performance
CREATE INDEX IF NOT EXISTS idx_wanted_listings_campus ON public.wanted_listings(campus_id);
CREATE INDEX IF NOT EXISTS idx_wanted_listings_category ON public.wanted_listings(category);
CREATE INDEX IF NOT EXISTS idx_wanted_listings_requester ON public.wanted_listings(requester_id);
CREATE INDEX IF NOT EXISTS idx_wanted_listings_status ON public.wanted_listings(status);

-- 3. Add wanted_listing_id to conversations if missing
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS wanted_listing_id text REFERENCES public.wanted_listings(id) ON DELETE SET NULL;

-- 4. Ensure RLS is configured properly on wanted_listings
ALTER TABLE public.wanted_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Wanted listings are viewable by everyone" ON public.wanted_listings;
CREATE POLICY "Wanted listings are viewable by everyone"
  ON public.wanted_listings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create wanted listings" ON public.wanted_listings;
CREATE POLICY "Authenticated users can create wanted listings"
  ON public.wanted_listings FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Requesters can update their own wanted listings" ON public.wanted_listings;
CREATE POLICY "Requesters can update their own wanted listings"
  ON public.wanted_listings FOR UPDATE
  USING (auth.uid() = requester_id)
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Requesters can delete their own wanted listings" ON public.wanted_listings;
CREATE POLICY "Requesters can delete their own wanted listings"
  ON public.wanted_listings FOR DELETE
  USING (auth.uid() = requester_id);

-- 5. Ensure users table allows public read & self update
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON public.users;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. Rooms & Accommodations Deletion Policies
DROP POLICY IF EXISTS "Owners can delete their own rooms" ON public.rooms;
CREATE POLICY "Owners can delete their own rooms"
  ON public.rooms FOR DELETE
  USING (auth.uid() = owner_id);

-- 7. Roommate Profiles Deletion Policies
DROP POLICY IF EXISTS "Users can delete their own roommate profiles" ON public.roommate_profiles;
CREATE POLICY "Users can delete their own roommate profiles"
  ON public.roommate_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Unified Chat & Messaging Deletion & Management Policies
DROP POLICY IF EXISTS "Members can delete conversations" ON public.conversations;
CREATE POLICY "Members can delete conversations"
  ON public.conversations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can delete conversation members" ON public.conversation_members;
CREATE POLICY "Members can delete conversation members"
  ON public.conversation_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can delete messages" ON public.messages;
CREATE POLICY "Members can delete messages"
  ON public.messages FOR DELETE
  USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Done!
