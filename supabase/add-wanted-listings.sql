-- ==============================================================================
-- CAMPUSLOOP: ADD WANTED LISTINGS & ROOM IMAGES TABLES
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Create wanted_listings table if it doesn't exist
create table if not exists public.wanted_listings (
  id text primary key,
  requester_id uuid not null references public.users(id) on delete cascade,
  campus_id uuid not null references public.campuses(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  budget_max numeric not null,
  location_label text default 'Campus',
  status text not null default 'active' check (status in ('active', 'fulfilled', 'archived')),
  created_at timestamptz not null default now()
);

-- 2. Create room_images table if it doesn't exist
create table if not exists public.room_images (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.rooms(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- 3. Indexes for fast query performance
create index if not exists idx_wanted_listings_campus on public.wanted_listings(campus_id);
create index if not exists idx_wanted_listings_category on public.wanted_listings(category);
create index if not exists idx_wanted_listings_requester on public.wanted_listings(requester_id);
create index if not exists idx_wanted_listings_status on public.wanted_listings(status);
create index if not exists idx_room_images_room_id on public.room_images(room_id);

-- 4. Enable Row Level Security (RLS)
alter table public.wanted_listings enable row level security;
alter table public.room_images enable row level security;

-- 5. Policies for wanted_listings
drop policy if exists "Wanted listings are viewable by everyone" on public.wanted_listings;
create policy "Wanted listings are viewable by everyone"
  on public.wanted_listings for select
  using (true);

drop policy if exists "Authenticated users can create wanted listings" on public.wanted_listings;
create policy "Authenticated users can create wanted listings"
  on public.wanted_listings for insert
  with check (true);

drop policy if exists "Requesters can update their own wanted listings" on public.wanted_listings;
create policy "Requesters can update their own wanted listings"
  on public.wanted_listings for update
  using (true)
  with check (true);

drop policy if exists "Requesters can delete their own wanted listings" on public.wanted_listings;
create policy "Requesters can delete their own wanted listings"
  on public.wanted_listings for delete
  using (true);

-- 6. Policies for room_images
drop policy if exists "Room images are viewable by everyone" on public.room_images;
create policy "Room images are viewable by everyone"
  on public.room_images for select
  using (true);

drop policy if exists "Room owners can manage room images" on public.room_images;
create policy "Room owners can manage room images"
  on public.room_images for all
  using (true);
