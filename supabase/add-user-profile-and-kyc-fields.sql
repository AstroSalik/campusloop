-- ============================================================================
-- CAMPUSLOOP SCHEMA MIGRATION: USER PROFILE ENRICHMENT & AADHAAR KYC
-- Run this in Supabase SQL Editor to expand public.users table
-- ============================================================================

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

