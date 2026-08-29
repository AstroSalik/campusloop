-- ==============================================================================
-- CAMPUSLOOP — ALL-IN-ONE SUPABASE SETUP SCRIPT
-- Paste this entire script into your Supabase SQL Editor and click "Run".
-- It creates all tables, enables RLS, sets security policies, and inserts seed data.
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
  id text primary key,
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

-- 6. Roommate Profiles
create table roommate_profiles (
  id text primary key,
  user_id uuid not null references users(id) on delete cascade,
  budget_min numeric not null,
  budget_max numeric not null,
  preferred_location text not null,
  move_in_month text not null,
  lifestyle_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 7. Conversations
create table conversations (
  id text primary key,
  listing_id text references listings(id) on delete set null,
  room_id text references rooms(id) on delete set null,
  wanted_listing_id text references wanted_listings(id) on delete set null,
  type text not null check (type in ('marketplace_dm', 'housing_group', 'roommate_dm', 'wanted_response')),
  created_at timestamptz not null default now()
);

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
  id text primary key,
  conversation_id text not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 10. Rent Splits
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

-- Indexes
create index if not exists idx_listings_campus on listings(campus_id);
create index if not exists idx_listings_category on listings(category);
create index if not exists idx_wanted_listings_campus on wanted_listings(campus_id);
create index if not exists idx_wanted_listings_category on wanted_listings(category);
create index if not exists idx_wanted_listings_requester on wanted_listings(requester_id);
create index if not exists idx_rooms_campus on rooms(campus_id);
create index if not exists idx_messages_conv on messages(conversation_id, created_at asc);

-- RLS Policies
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

create policy "Allow all access to campuses" on campuses for all using (true) with check (true);
create policy "Allow all access to users" on users for all using (true) with check (true);
create policy "Allow all access to listings" on listings for all using (true) with check (true);
create policy "Allow all access to wanted_listings" on wanted_listings for all using (true) with check (true);
create policy "Allow all access to listing_images" on listing_images for all using (true) with check (true);
create policy "Allow all access to rooms" on rooms for all using (true) with check (true);
create policy "Allow all access to roommate_profiles" on roommate_profiles for all using (true) with check (true);
create policy "Allow all access to conversations" on conversations for all using (true) with check (true);
create policy "Allow all access to conversation_members" on conversation_members for all using (true) with check (true);
create policy "Allow all access to messages" on messages for all using (true) with check (true);
create policy "Allow all access to rent_splits" on rent_splits for all using (true) with check (true);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- 1. Campus
INSERT INTO campuses (id, name, city) VALUES
('00000000-0000-0000-0000-000000000001', 'Demo Campus', 'Sopore');

-- 2. Demo Student Users
INSERT INTO users (id, name, email, campus_id, monthly_income, avatar) VALUES
('11111111-1111-1111-1111-111111111111', 'Bilal Ashiq', 'bilal.demo@campusloop.app', '00000000-0000-0000-0000-000000000001', 15000, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'),
('22222222-2222-2222-2222-222222222222', 'Sukhmanpreet Kaur', 'sukhman.demo@campusloop.app', '00000000-0000-0000-0000-000000000001', 12000, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
('33333333-3333-3333-3333-333333333333', 'Salik Riyaz', 'salik.demo@campusloop.app', '00000000-0000-0000-0000-000000000001', 18000, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
('44444444-4444-4444-4444-444444444444', 'Sana Wani', 'sana.demo@campusloop.app', '00000000-0000-0000-0000-000000000001', 10000, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'),
('55555555-5555-5555-5555-555555555555', 'Vikram Iyer', 'vikram.demo@campusloop.app', '00000000-0000-0000-0000-000000000001', 20000, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'),
('66666666-6666-6666-6666-666666666666', 'Zoya Malik', 'zoya.demo@campusloop.app', '00000000-0000-0000-0000-000000000001', 14000, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80');

-- 3. Marketplace Listings
INSERT INTO listings (id, seller_id, campus_id, title, description, category, type, price, condition, location_label, status, created_at) VALUES
('l01-study-table', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Study Table with Drawer', 'Solid engineered wood study desk with 2 smooth-glide drawers. Great for laptop and books, no wobbling.', 'Furniture', 'sell', 1200, 'Good', 'Hostel 3', 'active', NOW() - INTERVAL '4 days'),
('l02-bajaj-lamp', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Bajaj LED Study Lamp', '3-level touch dimmable warm/white LED light. Flexible neck, USB rechargeable battery.', 'Furniture', 'sell', 450, 'Like New', 'Hostel 1', 'active', NOW() - INTERVAL '3.5 days'),
('l03-firefox-cycle', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Firefox Cycle (Single Speed)', 'Well maintained single speed commuter cycle. Front basket, mudguards, and wire lock included.', 'Cycles', 'sell', 3500, 'Good', 'Hostel 5', 'active', NOW() - INTERVAL '3 days'),
('l04-mini-fridge', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'Mini Fridge 45L', 'Compact 45-litre refrigerator with mini freezer section. Cools super fast, energy efficient.', 'Appliances', 'sell', 3000, 'Fair', 'Lovely Nagar PG', 'active', NOW() - INTERVAL '2.8 days'),
('l05-scientific-calc', '66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Casio fx-991EX Scientific Calculator', 'Original Casio ClassWiz fx-991EX with textbook display. Allowed for all engineering exams.', 'Electronics', 'sell', 900, 'Like New', 'Hostel 2', 'active', NOW() - INTERVAL '2.5 days'),
('l06-single-mattress', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Single Bed Foam Mattress', '4-inch high density foam mattress, standard hostel bed size (3x6 ft). Clean with protective cover.', 'Furniture', 'sell', 800, 'Good', 'Hostel 3', 'active', NOW() - INTERVAL '2.2 days'),
('l07-mechanics-book', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Engineering Mechanics Textbook', 'Standard syllabus textbook with solved problems and practice questions. No missing pages.', 'Books', 'sell', 350, 'Good', 'Hostel 1', 'active', NOW() - INTERVAL '2.0 days'),
('l08-jbl-speaker', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'JBL Go Bluetooth Speaker', 'Compact wireless speaker, 5 hours battery backup, waterproof design. Great sound for room.', 'Electronics', 'sell', 1100, 'Good', 'Hostel 5', 'active', NOW() - INTERVAL '1.8 days'),
('l09-steel-cupboard', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'Steel Cupboard (2-Door)', 'Monthly rental for spacious 2-door steel wardrobe with mirror and key locks.', 'Furniture', 'rent', 500, 'Good', 'Lovely Nagar PG', 'active', NOW() - INTERVAL '1.5 days'),
('l10-induction-cooktop', '66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Prestige Induction Cooktop 1600W', 'Push button induction stove with timer and preset Indian menus. Works perfectly with steel vessels.', 'Appliances', 'sell', 1300, 'Like New', 'Hostel 2', 'active', NOW() - INTERVAL '1.3 days'),
('l11-geared-cycle', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Hercules Geared Cycle (21-Speed)', 'Shimano 21-speed gears, front suspension, disc brakes. Freshly serviced with new brake pads.', 'Cycles', 'sell', 5500, 'Good', 'Main Gate PG', 'active', NOW() - INTERVAL '1.0 days'),
('l12-iron-box', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Philips Dry Iron Box', 'Lightweight 1000W dry iron with non-stick soleplate and temperature control dial.', 'Appliances', 'sell', 500, 'Fair', 'Hostel 3', 'active', NOW() - INTERVAL '0.9 days'),
('l13-cormen-algo', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Introduction to Algorithms (CLRS 3rd Edition)', 'The classic MIT algorithms bible. Clean binding, highlighted key chapters for DSA course.', 'Books', 'sell', 600, 'Good', 'Hostel 1', 'active', NOW() - INTERVAL '0.8 days'),
('l14-desk-chair', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Ergonomic Mesh Desk Chair', 'Monthly rental for breathable mesh back office chair with adjustable height and lumbar support.', 'Furniture', 'rent', 400, 'Good', 'Hostel 5', 'active', NOW() - INTERVAL '0.7 days'),
('l15-electric-kettle', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'Pigeon 1.5L Electric Kettle', 'Stainless steel electric boiling kettle with auto cut-off. Essential for late night noodles and tea.', 'Appliances', 'sell', 600, 'Like New', 'Lovely Nagar PG', 'active', NOW() - INTERVAL '0.6 days'),
('l16-wall-clock', '66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Silent Sweep Room Wall Clock', 'Ajanta 10-inch silent quartz clock. Zero ticking sound, great for study focus.', 'Other', 'sell', 200, 'Good', 'Hostel 2', 'active', NOW() - INTERVAL '0.5 days'),
('l17-badminton-set', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Yonex Badminton Racket Set (2 Rackets + 3 Shuttles)', 'Graphite shaft pair with padded carrying case and tube of Mavis 350 nylon shuttles.', 'Other', 'sell', 700, 'Good', 'Main Gate PG', 'active', NOW() - INTERVAL '0.4 days'),
('l18-table-fan', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'High-Speed Desk Table Fan', 'Monthly rental for oscillating 3-speed table fan. Low noise, powerful airflow.', 'Appliances', 'rent', 300, 'Fair', 'Hostel 3', 'active', NOW() - INTERVAL '0.3 days'),
('l19-laptop-stand', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Aluminium Foldable Laptop Stand', '6-angle height adjustable aluminium riser. Sturdy, fits 11-16 inch laptops with silicone pads.', 'Electronics', 'sell', 650, 'Like New', 'Hostel 1', 'active', NOW() - INTERVAL '0.2 days'),
('l20-curtains', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Room Curtains (Set of 2, 7ft)', 'Navy blue blackout eyelet curtains for standard hostel window/door.', 'Other', 'sell', 400, 'Good', 'Hostel 5', 'active', NOW() - INTERVAL '0.1 days');

-- 3b. Wanted Listings (Reverse Marketplace Seed Data)
INSERT INTO wanted_listings (id, requester_id, campus_id, title, description, category, budget_max, status, created_at) VALUES
('w01-mini-fridge', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Looking for a mini fridge under ₹2500', 'Need a compact working mini-fridge for my room in Main Gate PG. Must cool properly, cosmetic scratches are totally fine.', 'Appliances', 2500, 'active', NOW() - INTERVAL '2 days'),
('w02-study-table', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Need a study table, budget ₹1000', 'Looking for a sturdy wooden or metal study desk for Hostel 3. Prefer something with a small drawer or shelf for books.', 'Furniture', 1000, 'active', NOW() - INTERVAL '1.8 days'),
('w03-casio-calc', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Looking for Casio fx-991EX or fx-991CW Calculator', 'Urgent requirement for upcoming semester exams. Need genuine Casio scientific calculator with all buttons working smoothly.', 'Electronics', 750, 'active', NOW() - INTERVAL '1.5 days'),
('w04-mattress', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Need Single Bed Mattress for Hostel 5', 'Looking for a clean 4-inch single bed foam mattress. Budget around ₹700, can pick up immediately from any hostel on campus.', 'Furniture', 700, 'active', NOW() - INTERVAL '1.2 days'),
('w05-electric-kettle', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'Looking for an Electric Kettle under ₹500', 'Need a working 1.5L or 1.8L stainless steel electric kettle for tea and boiling water. Should auto shut-off.', 'Appliances', 500, 'active', NOW() - INTERVAL '1.0 days'),
('w06-geared-cycle', '66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Need 21-Speed Geared Bicycle (any brand)', 'Seeking a reliable geared commuter cycle for daily transit between PG and campus. Brakes and gear shifters must be in working order.', 'Cycles', 4000, 'active', NOW() - INTERVAL '0.6 days');

-- 4. Listing Images
INSERT INTO listing_images (id, listing_id, image_url) VALUES
('img-l01', 'l01-study-table', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80'),
('img-l02', 'l02-bajaj-lamp', 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80'),
('img-l03', 'l03-firefox-cycle', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'),
('img-l04', 'l04-mini-fridge', 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'),
('img-l05', 'l05-scientific-calc', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80'),
('img-l06', 'l06-single-mattress', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'),
('img-l07', 'l07-mechanics-book', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'),
('img-l08', 'l08-jbl-speaker', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'),
('img-l09', 'l09-steel-cupboard', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80'),
('img-l10', 'l10-induction-cooktop', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'),
('img-l11', 'l11-geared-cycle', 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=800&q=80'),
('img-l12', 'l12-iron-box', 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80'),
('img-l13', 'l13-cormen-algo', 'https://images.unsplash.com/photo-1532012164546-f432f2e37271?auto=format&fit=crop&w=800&q=80'),
('img-l14', 'l14-desk-chair', 'https://images.unsplash.com/photo-1580481077111-2b08a9fa6600?auto=format&fit=crop&w=800&q=80'),
('img-l15', 'l15-electric-kettle', 'https://images.unsplash.com/photo-1594213114663-d94db9b17125?auto=format&fit=crop&w=800&q=80'),
('img-l16', 'l16-wall-clock', 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80'),
('img-l17', 'l17-badminton-set', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'),
('img-l18', 'l18-table-fan', 'https://images.unsplash.com/photo-1618941716939-553df3c6c278?auto=format&fit=crop&w=800&q=80'),
('img-l19', 'l19-laptop-stand', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'),
('img-l20', 'l20-curtains', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80');

-- 5. Rooms (Housing Listings)
INSERT INTO rooms (id, owner_id, campus_id, title, rent, utilities, maintenance, bedrooms, occupancy_total, occupancy_filled, amenities, location_label, available_from, status, created_at) VALUES
('r01-main-gate-2bhk', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', '2BHK Near Main Gate', 18000, 1500, 900, 2, 3, 2, ARRAY['WiFi', 'Geyser', 'RO Water', 'Power Backup', 'Beds & Mattresses'], 'Main Gate PG', 'Sept 1st', 'available', NOW() - INTERVAL '5 days'),
('r02-hostel2-single', '66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Single Room PG (Hostel 2 area)', 8000, 800, 400, 1, 1, 0, ARRAY['Attached Washroom', 'WiFi', 'Study Table', 'Geyser'], 'Hostel 2 area', 'Immediate', 'available', NOW() - INTERVAL '4.5 days'),
('r03-shared-flat-3bhk', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '3BHK Shared Flat', 24000, 2000, 1000, 3, 4, 2, ARRAY['Modular Kitchen', 'Balcony', 'Washing Machine', 'WiFi', 'Security Guard'], 'Lovely Nagar PG', 'Sept 15th', 'available', NOW() - INTERVAL '4 days'),
('r04-twin-sharing-pg', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'PG Room (Twin Sharing)', 6500, 600, 300, 1, 2, 1, ARRAY['Mess Included', 'WiFi', 'Daily Cleaning', 'AC'], 'Hostel 3', 'Immediate', 'available', NOW() - INTERVAL '3.5 days'),
('r05-studio-1bhk', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', '1BHK Studio Apartment', 12000, 1200, 500, 1, 1, 0, ARRAY['Kitchenette', 'Fridge', 'WiFi', 'Geyser', 'Balcony'], 'Hostel 1 area', 'Oct 1st', 'available', NOW() - INTERVAL '3 days'),
('r06-hostel5-2bhk', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', '2BHK Near Hostel 5', 16000, 1400, 800, 2, 3, 2, ARRAY['WiFi', 'Beds & Study Tables', 'Geyser', 'Inverter Backup'], 'Hostel 5', 'Sept 1st', 'available', NOW() - INTERVAL '2 days'),
('r07-triple-sharing-pg', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'PG Triple Sharing Room', 5500, 500, 300, 1, 3, 2, ARRAY['Food Included', 'WiFi', 'Daily Housekeeping', 'CCTV'], 'Lovely Nagar PG', 'Immediate', 'available', NOW() - INTERVAL '1.5 days'),
('r08-furnished-2bhk', '66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', '2BHK Furnished Flat', 20000, 1800, 900, 2, 3, 1, ARRAY['Fully Furnished', 'AC', 'Washing Machine', 'Modular Kitchen', 'Lift'], 'Hostel 2 area', 'Oct 1st', 'available', NOW() - INTERVAL '1 day');

-- 6. Roommate Profiles
INSERT INTO roommate_profiles (id, user_id, budget_min, budget_max, preferred_location, move_in_month, lifestyle_tags) VALUES
('prof-01', '11111111-1111-1111-1111-111111111111', 6000, 9000, 'Main Gate PG', 'September', ARRAY['Quiet Study', 'Early Bird', 'Non-Smoker', 'Veg/Non-Veg OK']),
('prof-02', '22222222-2222-2222-2222-222222222222', 5000, 8000, 'Hostel 3', 'September', ARRAY['Vegetarian', 'Clean & Tidy', 'Studious', 'Non-Smoker']),
('prof-03', '33333333-3333-3333-3333-333333333333', 7000, 10000, 'Hostel 1', 'October', ARRAY['Night Owl', 'Tech Enthusiast', 'Chill Vibes', 'Non-Smoker']),
('prof-04', '44444444-4444-4444-4444-444444444444', 6000, 9000, 'Hostel 5', 'September', ARRAY['Early Bird', 'Organized', 'Fitness', 'Non-Smoker']),
('prof-05', '55555555-5555-5555-5555-555555555555', 8000, 12000, 'Lovely Nagar PG', 'September', ARRAY['Foodie', 'Music OK', 'Friendly', 'Non-Smoker']),
('prof-06', '66666666-6666-6666-6666-666666666666', 6500, 10000, 'Lovely Nagar PG', 'October', ARRAY['Quiet Study', 'Cat Friendly', 'Vegetarian', 'Non-Smoker']),
('prof-07', '11111111-1111-1111-1111-111111111111', 5000, 7000, 'Hostel 2 area', 'September', ARRAY['Economical', 'Shared Kitchen', 'Non-Smoker']),
('prof-08', '33333333-3333-3333-3333-333333333333', 7000, 11000, 'Main Gate PG', 'September', ARRAY['Coding Late', 'AC Preferred', 'Clean Space']),
('prof-09', '55555555-5555-5555-5555-555555555555', 6000, 9000, 'Hostel 5', 'October', ARRAY['Gym', 'Friendly', 'Non-Smoker']),
('prof-10', '22222222-2222-2222-2222-222222222222', 9000, 13000, 'Main Gate PG', 'September', ARRAY['Private Room', 'Balcony', 'Peaceful', 'Non-Smoker']);

-- 7. Conversations
INSERT INTO conversations (id, listing_id, room_id, type, created_at) VALUES
('c01-cycle-dm', 'l03-firefox-cycle', NULL, 'marketplace_dm', NOW() - INTERVAL '2 days'),
('c02-table-dm', 'l01-study-table', NULL, 'marketplace_dm', NOW() - INTERVAL '1.5 days'),
('c03-room1-group', NULL, 'r01-main-gate-2bhk', 'housing_group', NOW() - INTERVAL '3 days'),
('c04-room6-group', NULL, 'r06-hostel5-2bhk', 'housing_group', NOW() - INTERVAL '2 days');

-- 8. Conversation Members
INSERT INTO conversation_members (conversation_id, user_id, role) VALUES
('c01-cycle-dm', '11111111-1111-1111-1111-111111111111', 'buyer'),
('c01-cycle-dm', '44444444-4444-4444-4444-444444444444', 'seller'),
('c02-table-dm', '33333333-3333-3333-3333-333333333333', 'buyer'),
('c02-table-dm', '22222222-2222-2222-2222-222222222222', 'seller'),
('c03-room1-group', '55555555-5555-5555-5555-555555555555', 'owner'),
('c03-room1-group', '33333333-3333-3333-3333-333333333333', 'prospective_roommate'),
('c03-room1-group', '44444444-4444-4444-4444-444444444444', 'prospective_roommate'),
('c04-room6-group', '44444444-4444-4444-4444-444444444444', 'owner'),
('c04-room6-group', '11111111-1111-1111-1111-111111111111', 'prospective_roommate'),
('c04-room6-group', '22222222-2222-2222-2222-222222222222', 'prospective_roommate');

-- 9. Messages
INSERT INTO messages (id, conversation_id, sender_id, content, created_at) VALUES
('m01', 'c01-cycle-dm', '11111111-1111-1111-1111-111111111111', 'Hi Sana, is the Firefox cycle still available? Can I test ride it near Hostel 5 today?', NOW() - INTERVAL '2 days'),
('m02', 'c01-cycle-dm', '44444444-4444-4444-4444-444444444444', 'Yes Bilal! It is available. I will be near the Hostel 5 entrance around 5:30 PM.', NOW() - INTERVAL '1.9 days'),
('m03', 'c02-table-dm', '33333333-3333-3333-3333-333333333333', 'Hey Sukhman, does the study table fit inside a standard double-sharing room?', NOW() - INTERVAL '1.5 days'),
('m04', 'c02-table-dm', '22222222-2222-2222-2222-222222222222', 'Yes Salik, dimensions are 3.5ft x 2ft. Easily fits beside the bed!', NOW() - INTERVAL '1.4 days'),
('m05', 'c03-room1-group', '55555555-5555-5555-5555-555555555555', 'Welcome to the 2BHK Main Gate group thread! 2 spots are booked, 1 spot remaining.', NOW() - INTERVAL '3 days'),
('m06', 'c03-room1-group', '33333333-3333-3333-3333-333333333333', 'Hey Vikram, is electricity billed on actual units or fixed monthly?', NOW() - INTERVAL '2.9 days'),
('m07', 'c03-room1-group', '55555555-5555-5555-5555-555555555555', 'Sub-meter is installed per flat, so we split the actual bill equally 3 ways.', NOW() - INTERVAL '2.8 days'),
('m08', 'c04-room6-group', '44444444-4444-4444-4444-444444444444', 'Group chat for 2BHK Near Hostel 5. Available from Sept 1st!', NOW() - INTERVAL '2 days');
