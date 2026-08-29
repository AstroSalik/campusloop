-- ============================================================================
-- CAMPUSLOOP SEED DATA SCRIPT
-- Strictly adheres to Seed-Data.md and PRD.md Section 6.
-- Uses custom student names: Bilal Ashiq, Sukhmanpreet Kaur, Salik Riyaz, Sana Wani, Vikram Iyer, Zoya Malik.
-- ============================================================================

-- 1. CAMPUSES
INSERT INTO campuses (id, name, location) VALUES
('00000000-0000-0000-0000-000000000001', 'Demo Campus', 'Sopore, Jammu & Kashmir')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location;

-- 2. USERS (6 Pre-seeded Demo Student Accounts)
INSERT INTO users (id, name, email, campus_id, monthly_income, avatar) VALUES
('11111111-1111-1111-1111-111111111111', 'Bilal Ashiq', 'bilal.demo@campusloop.app', '00000000-0000-0000-0000-000000000001', 15000, NULL),
('22222222-2222-2222-2222-222222222222', 'Sukhmanpreet Kaur', 'sukhman.demo@campusloop.app', '00000000-0000-0000-0000-000000000001', 12000, NULL),
('33333333-3333-3333-3333-333333333333', 'Salik Riyaz', 'salik.demo@campusloop.app', '00000000-0000-0000-0000-000000000001', 18000, NULL),
('44444444-4444-4444-4444-444444444444', 'Sana Wani', 'sana.demo@campusloop.app', '00000000-0000-0000-0000-000000000001', 10000, NULL),
('55555555-5555-5555-5555-555555555555', 'Vikram Iyer', 'vikram.demo@campusloop.app', '00000000-0000-0000-0000-000000000001', 20000, NULL),
('66666666-6666-6666-6666-666666666666', 'Zoya Malik', 'zoya.demo@campusloop.app', '00000000-0000-0000-0000-000000000001', 13000, NULL)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  email = EXCLUDED.email, 
  monthly_income = EXCLUDED.monthly_income;

-- 3. MARKETPLACE LISTINGS (20 Seeded Items across Categories)
INSERT INTO listings (id, seller_id, campus_id, title, description, category, type, price, condition, location_label, status, created_at) VALUES
('l01-study-table', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Wooden Study Table with Drawer', 'Sturdy wooden desk with smooth laminate top and drawer. Perfect for hostel room study setup.', 'Furniture', 'sell', 1800, 'Good', 'Hostel 3', 'active', NOW() - INTERVAL '3 days'),
('l02-casio-calc', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Casio FX-991EX Scientific Calculator', 'Original scientific calculator with solar backup. Mandatory for engineering and math courses.', 'Electronics', 'sell', 950, 'Like New', 'Hostel 1', 'active', NOW() - INTERVAL '2.8 days'),
('l03-firefox-cycle', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Firefox Single Speed Cycle', 'Lightweight hybrid bicycle, smooth brakes, newly installed bell and seat cover.', 'Cycles', 'sell', 3500, 'Good', 'Hostel 5', 'active', NOW() - INTERVAL '2.5 days'),
('l04-engg-physics', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Engineering Physics (Halliday & Resnick 10th Ed)', 'Standard textbook in great condition. No torn pages, minimal pencil markings.', 'Books', 'sell', 450, 'Like New', 'Hostel 2', 'active', NOW() - INTERVAL '2.2 days'),
('l05-bajaj-induction', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'Bajaj Induction Cooktop (1400W)', 'Fast heating induction stove with timer presets. Essential for PG cooking and quick boiling.', 'Appliances', 'sell', 1200, 'Good', 'Main Gate PG', 'active', NOW() - INTERVAL '2.0 days'),
('l06-mini-fridge', '66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Haier 50L Mini Refrigerator (PG Room)', 'Compact single-door fridge for drinks, milk, and snacks. Monthly rental available.', 'Appliances', 'rent', 800, 'Like New', 'Lovely Nagar PG', 'active', NOW() - INTERVAL '1.8 days'),
('l07-extension-board', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Anchor 4-Socket Surge Protected Extension Board', 'Heavy duty 2-meter cord with individual switches and USB charging slots.', 'Electronics', 'sell', 350, 'Like New', 'Hostel 3', 'active', NOW() - INTERVAL '1.6 days'),
('l08-foldable-mattress', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Wakefit 4-Inch Foldable Foam Mattress', 'Single bed high density foam mattress with washable cover. Folds into 3 for easy storage.', 'Furniture', 'sell', 1500, 'Good', 'Hostel 1', 'active', NOW() - INTERVAL '1.5 days'),
('l09-desk-lamp', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Wipro Re-chargeable LED Desk Lamp', '3 brightness levels with eye-protection warm light and flexible gooseneck.', 'Electronics', 'sell', 400, 'Good', 'Hostel 2', 'active', NOW() - INTERVAL '1.4 days'),
('l10-lab-coat', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'White Cotton Lab Coat (Size M)', 'Freshly washed cotton lab coat for chemistry and biology practicals.', 'Other', 'sell', 250, 'Like New', 'Hostel 2', 'active', NOW() - INTERVAL '1.3 days'),
('l11-geared-cycle', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Hercules Geared Cycle (21-Speed)', 'Shimano 21-speed gears, front suspension, disc brakes. Freshly serviced with new brake pads.', 'Cycles', 'sell', 5500, 'Good', 'Main Gate PG', 'active', NOW() - INTERVAL '1.0 days'),
('l12-iron-box', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Philips Dry Iron Box', 'Lightweight 1000W dry iron with non-stick soleplate and temperature control dial.', 'Appliances', 'sell', 500, 'Fair', 'Hostel 3', 'active', NOW() - INTERVAL '0.9 days'),
('l13-cormen-algo', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Introduction to Algorithms (CLRS 3rd Edition)', 'The classic MIT algorithms bible. Clean binding, highlighted key chapters for DSA course.', 'Books', 'sell', 600, 'Good', 'Hostel 1', 'active', NOW() - INTERVAL '0.8 days'),
('l14-desk-chair', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Ergonomic Mesh Desk Chair', 'Monthly rental for breathable mesh back office chair with adjustable height and lumbar support.', 'Furniture', 'rent', 400, 'Good', 'Hostel 5', 'active', NOW() - INTERVAL '0.7 days'),
('l15-electric-kettle', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'Pigeon 1.5L Electric Kettle', 'Stainless steel electric boiling kettle with auto cut-off. Essential for late night noodles and tea.', 'Appliances', 'sell', 600, 'Like New', 'Lovely Nagar PG', 'active', NOW() - INTERVAL '0.6 days'),
('l16-wall-clock', '66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Silent Sweep Room Wall Clock', 'Ajanta 10-inch silent quartz clock. Zero ticking sound, great for study focus.', 'Other', 'sell', 200, 'Good', 'Hostel 2', 'active', NOW() - INTERVAL '0.5 days'),
('l17-badminton-set', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Yonex Badminton Racket Set (2 Rackets + 3 Shuttles)', 'Graphite shaft pair with padded carrying case and tube of Mavis 350 nylon shuttles.', 'Other', 'sell', 700, 'Good', 'Main Gate PG', 'active', NOW() - INTERVAL '0.4 days'),
('l18-table-fan', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'High-Speed Desk Table Fan', 'Monthly rental for oscillating 3-speed table fan. Low noise, powerful airflow.', 'Appliances', 'rent', 300, 'Fair', 'Hostel 3', 'active', NOW() - INTERVAL '0.3 days'),
('l19-laptop-stand', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Aluminium Foldable Laptop Stand', '6-angle height adjustable aluminium riser. Sturdy, fits 11-16 inch laptops with silicone pads.', 'Electronics', 'sell', 650, 'Like New', 'Hostel 1', 'active', NOW() - INTERVAL '0.2 days'),
('l20-curtains', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Room Curtains (Set of 2, 7ft)', 'Navy blue blackout eyelet curtains for standard hostel window/door.', 'Other', 'sell', 400, 'Good', 'Hostel 5', 'active', NOW() - INTERVAL '0.1 days')
ON CONFLICT (id) DO NOTHING;

-- 3b. WANTED LISTINGS (Reverse Marketplace Requests)
INSERT INTO wanted_listings (id, requester_id, campus_id, title, description, category, budget_max, status, created_at) VALUES
('w01-mini-fridge', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Looking for a mini fridge under ₹2500', 'Need a compact working mini-fridge for my room in Main Gate PG. Must cool properly, cosmetic scratches are totally fine.', 'Appliances', 2500, 'active', NOW() - INTERVAL '2 days'),
('w02-study-table', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Need a study table, budget ₹1000', 'Looking for a sturdy wooden or metal study desk for Hostel 3. Prefer something with a small drawer or shelf for books.', 'Furniture', 1000, 'active', NOW() - INTERVAL '1.8 days'),
('w03-casio-calc', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Looking for Casio fx-991EX or fx-991CW Calculator', 'Urgent requirement for upcoming semester exams. Need genuine Casio scientific calculator with all buttons working smoothly.', 'Electronics', 750, 'active', NOW() - INTERVAL '1.5 days'),
('w04-mattress', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Need Single Bed Mattress for Hostel 5', 'Looking for a clean 4-inch single bed foam mattress. Budget around ₹700, can pick up immediately from any hostel on campus.', 'Furniture', 700, 'active', NOW() - INTERVAL '1.2 days'),
('w05-electric-kettle', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'Looking for an Electric Kettle under ₹500', 'Need a working 1.5L or 1.8L stainless steel electric kettle for tea and boiling water. Should auto shut-off.', 'Appliances', 500, 'active', NOW() - INTERVAL '1.0 days'),
('w06-geared-cycle', '66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Need 21-Speed Geared Bicycle (any brand)', 'Seeking a reliable geared commuter cycle for daily transit between PG and campus. Brakes and gear shifters must be in working order.', 'Cycles', 4000, 'active', NOW() - INTERVAL '0.6 days')
ON CONFLICT (id) DO NOTHING;

-- 4. ROOMS (8 Accommodations with Varied Splits)
INSERT INTO rooms (id, owner_id, campus_id, title, rent, utilities, maintenance, bedrooms, occupancy_total, occupancy_filled, amenities, location_label, available_from, status, created_at) VALUES
('r01-main-gate-2bhk', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', '2BHK Near Main Gate', 18000, 1500, 900, 2, 3, 2, ARRAY['WiFi', 'Geyser', 'RO Water', 'Power Backup', 'Beds & Mattresses'], 'Main Gate PG', 'Sept 1st', 'available', NOW() - INTERVAL '5 days'),
('r02-hostel2-single', '66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', 'Single Room PG (Hostel 2 area)', 8000, 800, 400, 1, 1, 0, ARRAY['Attached Washroom', 'WiFi', 'Study Table', 'Geyser'], 'Hostel 2 area', 'Immediate', 'available', NOW() - INTERVAL '4.5 days'),
('r03-shared-flat-3bhk', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '3BHK Shared Flat', 24000, 2000, 1000, 3, 4, 2, ARRAY['Modular Kitchen', 'Balcony', 'Washing Machine', 'WiFi', 'Security Guard'], 'Lovely Nagar PG', 'Sept 15th', 'available', NOW() - INTERVAL '4 days'),
('r04-twin-sharing-pg', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'PG Room (Twin Sharing)', 6500, 600, 300, 1, 2, 1, ARRAY['Mess Included', 'WiFi', 'Daily Cleaning', 'AC'], 'Hostel 3', 'Immediate', 'available', NOW() - INTERVAL '3.5 days'),
('r05-studio-1bhk', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', '1BHK Studio Apartment', 12000, 1200, 500, 1, 1, 0, ARRAY['Kitchenette', 'Fridge', 'WiFi', 'Geyser', 'Balcony'], 'Hostel 1 area', 'Oct 1st', 'available', NOW() - INTERVAL '3 days'),
('r06-hostel5-2bhk', '44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', '2BHK Near Hostel 5', 16000, 1400, 800, 2, 3, 2, ARRAY['WiFi', 'Beds & Study Tables', 'Geyser', 'Inverter Backup'], 'Hostel 5', 'Sept 1st', 'available', NOW() - INTERVAL '2 days'),
('r07-triple-sharing-pg', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'PG Triple Sharing Room', 5500, 500, 300, 1, 3, 2, ARRAY['Food Included', 'WiFi', 'Daily Housekeeping', 'CCTV'], 'Lovely Nagar PG', 'Immediate', 'available', NOW() - INTERVAL '1.5 days'),
('r08-furnished-2bhk', '66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000001', '2BHK Furnished Flat', 20000, 1800, 900, 2, 3, 1, ARRAY['Fully Furnished', 'AC', 'Washing Machine', 'Modular Kitchen', 'Lift'], 'Hostel 2 area', 'Oct 1st', 'available', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 5. ROOMMATE PROFILES (10 Student Preference Profiles)
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
('prof-10', '22222222-2222-2222-2222-222222222222', 9000, 13000, 'Main Gate PG', 'September', ARRAY['Private Room', 'Balcony', 'Peaceful', 'Non-Smoker'])
ON CONFLICT (id) DO NOTHING;

-- 6. CONVERSATIONS (5 Unified Threads)
INSERT INTO conversations (id, listing_id, room_id, type, created_at) VALUES
('conv-a-firefox-cycle', 'l03-firefox-cycle', NULL, 'marketplace_dm', NOW() - INTERVAL '24 hours'),
('conv-b-geared-cycle', 'l11-geared-cycle', NULL, 'marketplace_dm', NOW() - INTERVAL '18 hours'),
('conv-c-room1-group', NULL, 'r01-main-gate-2bhk', 'housing_group', NOW() - INTERVAL '30 hours'),
('conv-d-room6-group', NULL, 'r06-hostel5-2bhk', 'housing_group', NOW() - INTERVAL '20 hours'),
('conv-e-room3-group', NULL, 'r03-shared-flat-3bhk', 'housing_group', NOW() - INTERVAL '15 hours')
ON CONFLICT (id) DO NOTHING;

-- CONVERSATION MEMBERS
INSERT INTO conversation_members (conversation_id, user_id, role) VALUES
-- Conv A
('conv-a-firefox-cycle', '44444444-4444-4444-4444-444444444444', 'seller'),
('conv-a-firefox-cycle', '11111111-1111-1111-1111-111111111111', 'buyer'),
-- Conv B
('conv-b-geared-cycle', '11111111-1111-1111-1111-111111111111', 'seller'),
('conv-b-geared-cycle', '55555555-5555-5555-5555-555555555555', 'buyer'),
-- Conv C (Group Chat: Vikram + Bilal + Salik)
('conv-c-room1-group', '55555555-5555-5555-5555-555555555555', 'owner'),
('conv-c-room1-group', '11111111-1111-1111-1111-111111111111', 'prospective_roommate'),
('conv-c-room1-group', '33333333-3333-3333-3333-333333333333', 'prospective_roommate'),
-- Conv D (Group Chat: Sana + Sukhmanpreet + Zoya)
('conv-d-room6-group', '44444444-4444-4444-4444-444444444444', 'owner'),
('conv-d-room6-group', '22222222-2222-2222-2222-222222222222', 'prospective_roommate'),
('conv-d-room6-group', '66666666-6666-6666-6666-666666666666', 'prospective_roommate'),
-- Conv E (Group Chat: Bilal + Sana)
('conv-e-room3-group', '11111111-1111-1111-1111-111111111111', 'owner'),
('conv-e-room3-group', '44444444-4444-4444-4444-444444444444', 'prospective_roommate')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- MESSAGES
INSERT INTO messages (id, conversation_id, sender_id, content, created_at) VALUES
-- Conv A Messages
('msg-a-1', 'conv-a-firefox-cycle', '11111111-1111-1111-1111-111111111111', 'Hi, is the cycle still available?', NOW() - INTERVAL '22 hours'),
('msg-a-2', 'conv-a-firefox-cycle', '44444444-4444-4444-4444-444444444444', 'Yes it is! Barely used, good condition.', NOW() - INTERVAL '20 hours'),
('msg-a-3', 'conv-a-firefox-cycle', '11111111-1111-1111-1111-111111111111', 'Can you do ₹3200?', NOW() - INTERVAL '18 hours'),
('msg-a-4', 'conv-a-firefox-cycle', '44444444-4444-4444-4444-444444444444', '₹3300 and it''s yours, I can drop it at Hostel 5.', NOW() - INTERVAL '15 hours'),
('msg-a-5', 'conv-a-firefox-cycle', '11111111-1111-1111-1111-111111111111', 'Deal! I''ll come by tomorrow evening.', NOW() - INTERVAL '12 hours'),
-- Conv B Messages
('msg-b-1', 'conv-b-geared-cycle', '55555555-5555-5555-5555-555555555555', 'Does this have front and rear brakes in good condition?', NOW() - INTERVAL '16 hours'),
('msg-b-2', 'conv-b-geared-cycle', '11111111-1111-1111-1111-111111111111', 'Yes, serviced last month. Gears shift smoothly too.', NOW() - INTERVAL '14 hours'),
('msg-b-3', 'conv-b-geared-cycle', '55555555-5555-5555-5555-555555555555', 'Great, I''m interested. Can we meet near Main Gate PG?', NOW() - INTERVAL '10 hours'),
-- Conv C Messages
('msg-c-1', 'conv-c-room1-group', '11111111-1111-1111-1111-111111111111', 'Hi, I''m interested in the 2BHK — is the second bedroom still open?', NOW() - INTERVAL '28 hours'),
('msg-c-2', 'conv-c-room1-group', '55555555-5555-5555-5555-555555555555', 'Yes! One spot left after Aman moves in next week.', NOW() - INTERVAL '25 hours'),
('msg-c-3', 'conv-c-room1-group', '33333333-3333-3333-3333-333333333333', 'I just joined too — hi Bilal, looks like we might be flatmates!', NOW() - INTERVAL '20 hours'),
('msg-c-4', 'conv-c-room1-group', '11111111-1111-1111-1111-111111111111', 'Nice to meet you Salik, what''s your move-in timeline?', NOW() - INTERVAL '16 hours'),
('msg-c-5', 'conv-c-room1-group', '55555555-5555-5555-5555-555555555555', 'I can hold the spot till Sept 1st for both of you to decide.', NOW() - INTERVAL '10 hours'),
-- Conv D Messages
('msg-d-1', 'conv-d-room6-group', '22222222-2222-2222-2222-222222222222', 'Interested in this — is it furnished?', NOW() - INTERVAL '18 hours'),
('msg-d-2', 'conv-d-room6-group', '44444444-4444-4444-4444-444444444444', 'Yes, beds and study tables included, WiFi is active.', NOW() - INTERVAL '15 hours'),
('msg-d-3', 'conv-d-room6-group', '66666666-6666-6666-6666-666666666666', 'I''m interested too, budget works for me.', NOW() - INTERVAL '12 hours'),
('msg-d-4', 'conv-d-room6-group', '44444444-4444-4444-4444-444444444444', 'Great, we''d just need one more person to fill it, feel free to invite anyone.', NOW() - INTERVAL '8 hours'),
-- Conv E Messages
('msg-e-1', 'conv-e-room3-group', '44444444-4444-4444-4444-444444444444', 'Hi, is the 3BHK still looking for 2 more people?', NOW() - INTERVAL '14 hours'),
('msg-e-2', 'conv-e-room3-group', '11111111-1111-1111-1111-111111111111', 'Yes, 2 spots open, ₹6000/person approx before utilities.', NOW() - INTERVAL '10 hours'),
('msg-e-3', 'conv-e-room3-group', '44444444-4444-4444-4444-444444444444', 'Sounds good, I''ll check with a friend who might want the other spot.', NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

-- 7. RENT SPLITS (Saved Calculations for Dashboard Snapshot)
INSERT INTO rent_splits (id, room_id, calculated_by, total_rent, utilities, maintenance, occupants, per_person_share, housing_ratio, flag, created_at) VALUES
('split-01', 'r01-main-gate-2bhk', '11111111-1111-1111-1111-111111111111', 18000, 1500, 900, 3, 6800, 45.3, 'high', NOW() - INTERVAL '2 days'),
('split-02', 'r02-hostel2-single', '66666666-6666-6666-6666-666666666666', 8000, 800, 400, 1, 9200, 70.8, 'heavy', NOW() - INTERVAL '3 days'),
('split-03', 'r03-shared-flat-3bhk', '11111111-1111-1111-1111-111111111111', 24000, 2000, 1000, 4, 6750, 45.0, 'high', NOW() - INTERVAL '1 day'),
('split-04', 'r04-twin-sharing-pg', '22222222-2222-2222-2222-222222222222', 6500, 600, 300, 2, 3700, 30.8, 'moderate', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;
