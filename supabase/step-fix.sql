-- ==============================================================================
-- CampusLoop — Step Fix Migration (DDL, Constraints, RLS & Seed)
-- Run this in Supabase SQL Editor
-- ==============================================================================

-- 1. Create wanted_listings table if missing
create table if not exists wanted_listings (
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

-- 2. Add wanted_listing_id column to conversations table if missing
alter table conversations add column if not exists wanted_listing_id text references wanted_listings(id) on delete set null;

-- 3. Step 3 Hardening: Add partial unique index to prevent duplicate housing group conversations
create unique index if not exists uniq_housing_group_per_room on conversations(room_id) where type = 'housing_group' and room_id is not null;

-- 4. Enable RLS on wanted_listings
alter table wanted_listings enable row level security;

-- 5. RLS policies for wanted_listings
drop policy if exists "Wanted listings are viewable by everyone" on wanted_listings;
create policy "Wanted listings are viewable by everyone"
  on wanted_listings for select
  using (true);

drop policy if exists "Authenticated users can create wanted listings" on wanted_listings;
create policy "Authenticated users can create wanted listings"
  on wanted_listings for insert
  with check (auth.uid() = requester_id or auth.uid() is null);

drop policy if exists "Requesters can update their own wanted listings" on wanted_listings;
create policy "Requesters can update their own wanted listings"
  on wanted_listings for update
  using (auth.uid() = requester_id or auth.uid() is null)
  with check (auth.uid() = requester_id or auth.uid() is null);

drop policy if exists "Requesters can delete their own wanted listings" on wanted_listings;
create policy "Requesters can delete their own wanted listings"
  on wanted_listings for delete
  using (auth.uid() = requester_id or auth.uid() is null);

-- 6. Seed wanted listings
insert into wanted_listings (id, requester_id, campus_id, title, description, category, budget_max, status, created_at) values
  ('w01-mini-fridge', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Looking for a mini fridge under ₹2500', 'Need a compact working mini-fridge for my room in Main Gate PG. Must cool properly, cosmetic scratches or minor dents are totally fine. Can pick up this weekend.', 'Appliances', 2500, 'active', now() - interval '2 days'),
  ('w02-study-table', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Need a study table, budget ₹1000', 'Looking for a sturdy wooden or metal study desk for Hostel 3. Prefer something with a small drawer or shelf for books and laptop.', 'Furniture', 1000, 'active', now() - interval '1.8 days'),
  ('w03-casio-calc', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Looking for Casio fx-991EX or fx-991CW Calculator', 'Urgent requirement for upcoming semester exams. Need a genuine Casio scientific calculator with all matrix and complex functions working smoothly.', 'Electronics', 750, 'active', now() - interval '1.5 days'),
  ('w04-mattress', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Need Single Bed Mattress for Hostel 5', 'Looking for a clean 4-inch single bed foam mattress (standard hostel size 3x6 ft). Budget around ₹700, can pick up immediately from any hostel on campus.', 'Furniture', 700, 'active', now() - interval '1.2 days'),
  ('w05-electric-kettle', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'Looking for an Electric Kettle under ₹500', 'Need a working 1.5L or 1.8L stainless steel electric boiling kettle for tea and late night instant noodles. Should have auto shut-off.', 'Appliances', 500, 'active', now() - interval '1 day'),
  ('w06-geared-cycle', '66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Need 21-Speed Geared Bicycle (any brand)', 'Seeking a reliable geared commuter cycle for daily transit between PG and campus. Brakes and gear shifters must be in working order. Open to Hercules, Firefox, or Montra.', 'Cycles', 4000, 'active', now() - interval '14 hours')
on conflict (id) do nothing;
