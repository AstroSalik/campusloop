## CampusLoop — Seed Data Reference

Purpose: This is the authoritative demo dataset for CampusLoop, referenced by System-Build.md Phase 12. When this file is provided to Antigravity, it should be used directly to generate /supabase/seed.sql rather than inventing placeholder data at that stage. Volumes match PRD.md Section 9 exactly: 20 marketplace listings, 8 rooms, 10 roommate profiles, 5 conversations with messages, plus a couple of rent_splits.

All data uses Indian campus/hostel/PG context and INR pricing, per Project- Context.md Section 8.

## 1. Campus

| id (ref) campus_1 | name city Demo Campus Sopore |   |
| --- | --- | --- |

## 2. Demo Users

| id (ref) | name | email | monthly_income | notes |
| --- | --- | --- | --- | --- |
|   |   |   |   | primary |
| user_1 | Rahul | rahul.demo@campusloop.app | 15000 | demo |
|   | Sharma |   |   | login |
|   |   |   |   | account |
| user_2 | Priya | priya.demo@campusloop.app | 12000 |   |
|   | Nair |   |   |   |
| user_3 | Aman | aman.demo@campusloop.app | 18000 |   |
|   | Khan |   |   |   |
| user_4 | Sana | sana.demo@campusloop.app | 10000 |   |
|   | Wani |   |   |   |
| user_5 | Vikram | vikram.demo@campusloop.app | 20000 |   |
|   | Iyer |   |   |   |


| id (ref) | name | email | monthly_income | notes |
| --- | --- | --- | --- | --- |
| user_6 | Zoya | zoya.demo@campusloop.app | 13000 |   |
|   | Malik |   |   |   |

All belong to campus_1 (Demo Campus). Use these as the "Continue as Demo Student" quick-login accounts from System-Build.md Phase 3 — Rahul (user_1) should be the account used throughout the live demo.

## 3. Marketplace Listings (20)

| # | seller | title | category | type | price | condition | location_labe |
| --- | --- | --- | --- | --- | --- | --- | --- |
|   |   |   |   |   | (₹) |   |   |
| 1 | user_2 | Study Table | Furniture | sell | 1200 Good |   | Hostel 3 |
|   |   | with Drawer |   |   |   |   |   |
| 2 | user_3 | Bajaj Study | Furniture | sell | 450 | Like | Hostel 1 |
|   |   | Lamp |   |   |   | New |   |
|   |   | Firefox |   |   |   |   |   |
| 3 | user_4 | Cycle | Cycles | sell | 3500 Good |   | Hostel 5 |
|   |   | (Single |   |   |   |   |   |
|   |   | Speed) |   |   |   |   |   |
| 4 | user_5 | Mini Fridge | Appliances | sell | 3000 | Fair | Lovely Nagar |
|   |   | 45L |   |   |   |   | PG |
|   |   | Scientific |   |   |   |   |   |
| 5 | user_6 | Calculator | Electronics | sell | 900 | Like | Hostel 2 |
|   |   | (Casio fx- |   |   |   | New |   |
|   |   | 991) |   |   |   |   |   |
| 6 | user_2 | Single | Furniture | sell | 800 | Good | Hostel 3 |
|   |   | Mattress |   |   |   |   |   |
|   |   | Engineering |   |   |   |   |   |
| 7 | user_3 | Mechanics | Books | sell | 350 | Good | Hostel 1 |
|   |   | Textbook |   |   |   |   |   |
|   |   | Bluetooth |   |   |   |   |   |
| 8 | user_4 | Speaker | Electronics | sell | 1100 Good |   | Hostel 5 |
|   |   | (JBL Go) |   |   |   |   |   |


| # | seller | title | category | type | price | condition | location_labe |
| --- | --- | --- | --- | --- | --- | --- | --- |
|   |   |   |   |   | (₹) |   |   |
|   |   | Steel |   |   |   |   | Lovely Nagar |
| 9 | user_5 | Cupboard | Furniture | rent | 500 | Good | PG |
|   |   | (2-door) |   |   |   |   |   |
| 10 | user_6 | Induction | Appliances | sell | 1300 | Like | Hostel 2 |
|   |   | Cooktop |   |   |   | New |   |
|   |   | Cycle |   |   |   |   | Main Gate |
| 11 | user_1 | (Geared, | Cycles | sell | 5500 Good |   | PG |
|   |   | 21-speed) |   |   |   |   |   |
| 12 | user_2 | Iron Box | Appliances | sell | 500 | Fair | Hostel 3 |
|   |   | Data |   |   |   |   |   |
| 13 | user_3 | Structures | Books | sell | 600 | Good | Hostel 1 |
|   |   | Textbook |   |   |   |   |   |
|   |   | (Cormen) |   |   |   |   |   |
| 14 | user_4 | Desk Chair | Furniture | rent | 400 | Good | Hostel 5 |
|   |   | (Ergonomic) |   |   |   |   |   |
| 15 | user_5 | Electric | Appliances | sell | 600 | Like | Lovely Nagar |
|   |   | Kettle |   |   |   | New | PG |
| 16 | user_6 Wall Clock |   | Other | sell | 200 | Good | Hostel 2 |
| 17 | user_1 | Badminton | Other | sell | 700 | Good | Main Gate |
|   |   | Racket Set |   |   |   |   | PG |
| 18 | user_2 | Table Fan | Appliances | rent | 300 | Fair | Hostel 3 |
|   |   | Laptop |   |   |   | Like |   |
| 19 | user_3 | Stand | Electronics | sell | 650 | New | Hostel 1 |
|   |   | (Aluminium) |   |   |   |   |   |
| 20 | user_4 | Curtains | Other | sell | 400 | Good | Hostel 5 |
|   |   | (Set of 2) |   |   |   |   |   |

Include a placeholder image URL per listing (or leave listing_images empty and rely on a UI fallback placeholder graphic — do not block seeding on real image hosting).

## 4. Rooms / Housing (8)


| # owner | title | rent | utilities | maintenance | bedrooms | occupanc |
| --- | --- | --- | --- | --- | --- | --- |
|   |   | (₹) | (₹) | (₹) |   |   |
|   | 2BHK |   |   |   |   |   |
| 1 user_5 | Near | 18000 | 1500 | 900 | 2 | 3 |
|   | Main |   |   |   |   |   |
|   | Gate |   |   |   |   |   |
|   | Single |   |   |   |   |   |
| 2 user_6 | Room PG | 8000 | 800 | 400 | 1 | 1 |
|   | (Hostel 2 |   |   |   |   |   |
|   | area) |   |   |   |   |   |
|   | 3BHK |   |   |   |   |   |
| 3 user_1 | Shared | 24000 | 2000 | 1000 | 3 | 4 |
|   | Flat |   |   |   |   |   |
|   | PG Room |   |   |   |   |   |
| 4 user_2 | (Twin | 6500 | 600 | 300 | 1 | 2 |
|   | Sharing) |   |   |   |   |   |
| 5 user_3 | 1BHK | 12000 | 1200 | 500 | 1 | 1 |
|   | Studio |   |   |   |   |   |
|   | 2BHK |   |   |   |   |   |
| 6 user_4 | Near | 16000 | 1400 | 800 | 2 | 3 |
|   | Hostel 5 |   |   |   |   |   |
| 7 user_5 | PG Triple | 5500 | 500 | 300 | 1 | 3 |
|   | Sharing |   |   |   |   |   |
|   | 2BHK |   |   |   |   |   |
| 8 user_6 | Furnished | 20000 | 1800 | 900 | 2 | 3 |
|   | Flat |   |   |   |   |   |

Room #1 (2BHK Near Main Gate, owner user_5) and Room #6 (2BHK Near Hostel

5, owner user_4) are the two rooms used for the seeded housing_group conversations in Section 6 below — make sure their occupancy_filled consistent with the members already in those conversations.

values are

## 5. Roommate Profiles (10)


| # | user | budget_min | budget_max | preferred_location move_in_month | l |
| --- | --- | --- | --- | --- | --- |
|   |   | (₹) | (₹) |   |   |
| 1 | user_1 | 6000 | 9000 | Main Gate September |   |
| 2 | user_2 | 5000 | 8000 | Hostel 3 September |   |
| 3 | user_3 | 7000 | 10000 | Hostel 1 October |   |
| 4 | user_4 | 6000 | 9000 | Hostel 5 September |   |
| 5 | user_5 | 8000 | 12000 | Lovely Nagar September |   |
| 6 | user_6 | 6500 | 10000 | Lovely Nagar October |   |
| 7 | user_1 | 5000 | 7000 | Hostel 2 September |   |
| 8 | user_3 | 7000 | 11000 | Main Gate September |   |
| 9 | user_5 | 6000 | 9000 | Hostel 5 October |   |
| 10 | user_2 | 9000 | 13000 | Main Gate September |   |

Q

S

S

S

Q

S

S

E

S

N

S

Q

S

S

Q

S

L

S

S

Note: some users appear twice (e.g. user_1, user_3, user_5) — this is intentional, representing a student who has posted more than one preference window. This is fine for demo purposes; not a data integrity issue.

## 6. Conversations & Messages (5)

## Marketplace DMs (2)

Conversation A — linked to Listing #3 (Firefox Cycle, seller user_4)

- Members: user_4 (seller), user_1 (buyer)

- Messages:

1. user_1: "Hi, is the cycle still available?"

2. user_4: "Yes it is! Barely used, good condition."


3. user_1: "Can you do ₹3200?"

4. user_4: "₹3300 and it's yours, I can drop it at Hostel 5."

5. user_1: "Deal! I'll come by tomorrow evening."

Conversation B — linked to Listing #11 (Geared Cycle, seller user_1)

- Members: user_1 (seller), user_5 (buyer)

- Messages:

- 1. user_5: "Does this have front and rear brakes in good condition?"

2. user_1: "Yes, serviced last month. Gears shift smoothly too."

3. user_5: "Great, I'm interested. Can we meet near Main Gate PG?"

## Housing Group Chats (3, at least 2 required — using 3 for a richer demo)

Conversation C — linked to Room #1 (2BHK Near Main Gate, owner user_5)

- Members: user_5 (owner), user_1 (prospective_roommate), user_3 (prospective_roommate)

- Messages:

- 1. user_1: "Hi, I'm interested in the 2BHK — is the second bedroom still open?"

- 2. user_5: "Yes! One spot left after Aman moves in next week."

- 3. user_3: "I just joined too — hi Rahul, looks like we might be roommates!"

- 4. user_1: "Nice to meet you Aman, what's your move-in timeline?"

5. user_5: "I can hold the spot till Sept 1st for both of you to decide."

Conversation D — linked to Room #6 (2BHK Near Hostel 5, owner user_4)

- Members: user_4 (owner), user_2 (prospective_roommate), user_6 (prospective_roommate)

- Messages:

- 1. user_2: "Interested in this — is it furnished?"

- 2. user_4: "Yes, beds and study tables included, WiFi is active."

- 3. user_6: "I'm interested too, budget works for me."

- 4. user_4: "Great, we'd just need one more person to fill it, feel free to invite anyone."

Conversation E — linked to Room #3 (3BHK Shared Flat, owner user_1)

- Members: user_1 (owner), user_4 (prospective_roommate)

- Messages:

1. user_4: "Hi, is the 3BHK still looking for 2 more people?"

2. user_1: "Yes, 2 spots open, ₹6000/person approx before utilities."


3. user_4: "Sounds good, I'll check with a friend who might want the other spot."

## 7. Rent Splits (2, for dashboard snapshot data)

|   | user (for |   |   |   |   |   |
| --- | --- | --- | --- | --- | --- | --- |
| # | dashboard | room_id | total_rent | utilities maintenance | occupants | per_ |
|   | display) |   |   |   |   |   |
| 1 | user_1 | Room | 18000 | 1500 900 | 3 | 6800 |
|   |   | #1 |   |   |   |   |
| 2 | user_4 | Room | 16000 | 1400 800 | 3 | 6066 |
|   |   | #6 |   |   |   |   |

Use rent_split #1 (belonging to user_1 / Rahul, the primary demo account) as the value shown on the Dashboard's Rent Health snapshot widget (System-Build.md Phase 9) — this gives a realistic "high but not comfortable" flag to show off the color system without it looking artificially perfect.

## 8. Seeding Instructions for Antigravity

When this file is used at System-Build.md Phase 12:

- 1. Generate /supabase/seed.sql with plain SQL INSERT statements matching Sections 1–7 above exactly — do not invent additional rows beyond what's listed here, and do not reduce the counts (20 listings, 8 rooms, 10 roommate profiles, 5 conversations, 2 rent_splits are the exact required volumes per PRD.md Section 9).

- 2. Preserve the relationships exactly as described: which user owns which listing/room, which conversations link to which listing/room, and which users are members of which conversations.

- 3. Use realistic created_at timestamps spread over the past few days (not all identical) so lists have a sensible "most recent first" order.

- 4. After running the seed, verify per System-Build.md Phase 12's checkpoint: every page (dashboard, marketplace, housing, roommates, messages) shows populated data, and Conversation C and D specifically demonstrate the "group chat forms automatically" story when viewed.

- 5. Do not seed image files — use placeholder image handling as already established in Phase 5 (URL-paste fallback) rather than uploading real binary images during seeding.


This file is referenced by System-Build.md Phase 12 and should be provided to Antigravity at that point in the build, per the Master Initialization Prompt.
