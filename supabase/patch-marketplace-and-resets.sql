-- ==============================================================================
-- CampusLoop — Marketplace Quantity & Password Resets Schema Patch
-- Run this in your Supabase Dashboard -> SQL Editor (1-Click Run)
-- ==============================================================================

-- 1. Add marketplace quantity, sold-out timestamp, and restock requests count to listings
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS sold_out_at timestamptz DEFAULT NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS restock_requests_count integer NOT NULL DEFAULT 0;

-- 2. Create listing_restock_requests table
CREATE TABLE IF NOT EXISTS public.listing_restock_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id text NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_restock_request UNIQUE (listing_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_restock_requests_listing ON public.listing_restock_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_restock_requests_user ON public.listing_restock_requests(user_id);
ALTER TABLE public.listing_restock_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can insert restock requests" ON public.listing_restock_requests;
CREATE POLICY "Anyone authenticated can insert restock requests"
  ON public.listing_restock_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view restock requests" ON public.listing_restock_requests;
CREATE POLICY "Anyone can view restock requests"
  ON public.listing_restock_requests FOR SELECT
  USING (true);

-- 3. Password Resets Table
CREATE TABLE IF NOT EXISTS public.password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code_hash text NOT NULL,
  token text UNIQUE,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_email ON public.password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON public.password_resets(token);
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages password resets" ON public.password_resets;
CREATE POLICY "Service role manages password resets" ON public.password_resets FOR ALL USING (true) WITH CHECK (true);
