-- ============================================================================
-- CAMPUSLOOP SEED DATA SCRIPT (CLEAN SINGLE USER STATE)
-- Configured for Salik Riyaz (astrosalikriyaz@gmail.com)
-- ============================================================================

-- 1. CAMPUSES
INSERT INTO campuses (id, name, city) VALUES
('00000000-0000-0000-0000-000000000001', 'Demo Campus', 'Sopore, Jammu & Kashmir')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, city = EXCLUDED.city;

-- 2. USERS (Single Primary Student Account)
INSERT INTO users (id, name, email, campus_id, monthly_income, avatar) VALUES
('4898495c-0953-432c-8041-9efdc1eeab5f', 'Salik Riyaz', 'astrosalikriyaz@gmail.com', '00000000-0000-0000-0000-000000000001', 18000, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  email = EXCLUDED.email, 
  monthly_income = EXCLUDED.monthly_income;

-- 3. SAMPLE MARKETPLACE LISTINGS
INSERT INTO listings (id, seller_id, campus_id, title, description, category, type, price, condition, location_label, status, created_at) VALUES
('l01-study-table', '4898495c-0953-432c-8041-9efdc1eeab5f', '00000000-0000-0000-0000-000000000001', 'Study Table with Drawer', 'Solid engineered wood study desk with 2 smooth-glide drawers. Great for laptop and books, no wobbling.', 'Furniture', 'sell', 1200, 'Good', 'Hostel 1', 'active', NOW() - INTERVAL '4 days'),
('l02-bajaj-lamp', '4898495c-0953-432c-8041-9efdc1eeab5f', '00000000-0000-0000-0000-000000000001', 'Bajaj LED Study Lamp', '3-level touch dimmable warm/white LED light. Flexible neck, USB rechargeable battery.', 'Furniture', 'sell', 450, 'Like New', 'Hostel 1', 'active', NOW() - INTERVAL '3.5 days'),
('l03-firefox-cycle', '4898495c-0953-432c-8041-9efdc1eeab5f', '00000000-0000-0000-0000-000000000001', 'Firefox Cycle (Single Speed)', 'Well maintained single speed commuter cycle. Front basket, mudguards, and wire lock included.', 'Cycles', 'sell', 3500, 'Good', 'Hostel 1', 'active', NOW() - INTERVAL '3 days'),
('l05-scientific-calc', '4898495c-0953-432c-8041-9efdc1eeab5f', '00000000-0000-0000-0000-000000000001', 'Casio fx-991EX Scientific Calculator', 'Original Casio ClassWiz fx-991EX with textbook display. Allowed for all engineering exams.', 'Electronics', 'sell', 900, 'Like New', 'Hostel 1', 'active', NOW() - INTERVAL '2.5 days')
ON CONFLICT (id) DO NOTHING;

-- 4. LISTING IMAGES
INSERT INTO listing_images (id, listing_id, image_url) VALUES
('img-l01', 'l01-study-table', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80'),
('img-l02', 'l02-bajaj-lamp', 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80'),
('img-l03', 'l03-firefox-cycle', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'),
('img-l05', 'l05-scientific-calc', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- 5. SAMPLE HOUSING ROOMS
INSERT INTO rooms (id, owner_id, campus_id, title, rent, utilities, maintenance, bedrooms, occupancy_total, occupancy_filled, amenities, location_label, available_from, status, created_at) VALUES
('r01-main-gate-2bhk', '4898495c-0953-432c-8041-9efdc1eeab5f', '00000000-0000-0000-0000-000000000001', '2BHK Near Main Gate', 18000, 1500, 900, 2, 3, 1, ARRAY['WiFi', 'Geyser', 'RO Water', 'Power Backup', 'Beds & Mattresses'], 'Main Gate PG', 'Sept 1st', 'available', NOW() - INTERVAL '5 days'),
('r02-hostel2-single', '4898495c-0953-432c-8041-9efdc1eeab5f', '00000000-0000-0000-0000-000000000001', 'Single Room PG (Hostel 2 area)', 8000, 800, 400, 1, 1, 0, ARRAY['Attached Washroom', 'WiFi', 'Study Table', 'Geyser'], 'Hostel 2 area', 'Immediate', 'available', NOW() - INTERVAL '4.5 days')
ON CONFLICT (id) DO NOTHING;

-- 6. SAMPLE ROOMMATE PROFILES
INSERT INTO roommate_profiles (id, user_id, budget_min, budget_max, preferred_location, move_in_month, lifestyle_tags) VALUES
('prof-01', '4898495c-0953-432c-8041-9efdc1eeab5f', 6000, 9000, 'Main Gate PG', 'September', ARRAY['Quiet Study', 'Early Bird', 'Non-Smoker', 'Veg/Non-Veg OK'])
ON CONFLICT (id) DO NOTHING;
