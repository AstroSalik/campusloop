# CampusLoop — System Build File

**Purpose:** This is the staircase. Each prompt below is self-contained and meant to be pasted into Antigravity **one at a time, in order**. Every prompt assumes Antigravity already has `PRD.md` and `Project-Context.md` loaded/available in the project. Do not skip steps — each one builds on the last. Check off a step before moving to the next.

**How to use this file:** Copy one prompt block at a time into Antigravity. Wait for it to complete and verify the output before pasting the next. If something breaks, fix it before advancing the staircase — don't stack new steps on a broken foundation.

---

## Phase 0 — Foundation Prompt

**Goal:** Project scaffolding exists, builds, and runs. Nothing functional yet — just a clean skeleton.

```
Read PRD.md and Project-Context.md fully before doing anything.

Set up the CampusLoop project foundation:
1. Initialize a Next.js 14+ project with App Router and TypeScript, using the exact folder structure defined in Project-Context.md Section 2. Create every folder and placeholder page file listed there, even if pages are empty stubs for now.
2. Install and configure Tailwind CSS.
3. Install and initialize shadcn/ui (base config only, no components yet).
4. Install lucide-react.
5. Install @supabase/supabase-js and @supabase/ssr.
6. Create /lib/supabase/client.ts and /lib/supabase/server.ts per Project-Context.md Section 1 — use placeholder env var references (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) and create a .env.local.example file listing them.
7. Create /lib/types.ts with empty TypeScript interfaces stubbed for every table in PRD.md Section 6 (Users, Campus, Listing, ListingImage, Room, RoommateProfile, Conversation, ConversationMember, Message, RentSplit) — fields only, no logic yet.
8. Set up a root /app/layout.tsx with a basic HTML shell, Tailwind globals imported, and a placeholder title "CampusLoop".
9. Confirm the project builds and runs locally with no errors (npm run dev).

Do not add any UI design, any database schema, or any business logic yet — this step is scaffolding only. Stop and report what was created.
```

**✅ Checkpoint:** `npm run dev` runs with no errors, folder tree matches Project-Context.md Section 2 exactly.

---

## Phase 1 — Master Brand & Design System Prompt

**Goal:** The visual language is locked in one place, so every later page automatically looks cohesive without redesign.

```
Read Project-Context.md Section 4 (Design System) before doing anything.

Build the CampusLoop design system foundation:
1. Configure Tailwind theme colors to match Project-Context.md Section 4 exactly: primary deep blue (~#1E3A8A), and the four affordability flag colors (green #16A34A, yellow #CA8A04, orange #EA580C, red #DC2626) as named theme tokens (e.g. "flag-comfortable", "flag-moderate", "flag-high", "flag-heavy") — not raw hex used inline elsewhere.
2. Install these shadcn/ui components now, since they'll be reused everywhere: Card, Button, Input, Select, Badge, Skeleton, Toast (or Sonner), Avatar, Tabs, Dialog.
3. Build /components/shared/Navbar.tsx — top nav with CampusLoop logo/wordmark, a search icon, and a profile avatar placeholder. Deep blue accents, clean and minimal.
4. Build /components/shared/BottomNav.tsx — mobile bottom navigation with 5 icons (lucide-react): Home, Marketplace, Housing, Messages, Profile. This should only render on small screens.
5. Build /components/shared/EmptyState.tsx — a reusable component taking an icon, a title line, and an optional CTA button, per Project-Context.md Section 4's empty-state requirement.
6. Build /components/shared/LoadingSkeleton.tsx — a reusable card-shaped skeleton loader using shadcn's Skeleton, sized to match how ListingCard/RoomCard will look (rectangular image area + 2 text lines).
7. Wire Navbar and BottomNav into /app/layout.tsx so they appear on every page.
8. Create a small style-guide route at /app/style-guide/page.tsx that renders one of every component above with sample content, purely so we can visually sanity-check the design system in the browser before building real pages. This route can be deleted later — not part of the demo.

Follow the "startup, not assignment" tone from PRD.md Section 1 and Section 9 — polished, consistent spacing, no default-looking unstyled elements. Stop and report what was created; do not build any real feature pages yet.
```

**✅ Checkpoint:** Visit `/style-guide` — colors, cards, buttons, skeletons, empty states all look cohesive and intentional.

---

## Phase 2 — Database Schema & RLS Prompt

**Goal:** Supabase structure exists exactly as specified, with security in place from the start (per PRD Risk Log — don't leave this to the end).

```
Read PRD.md Section 6 (Data Model) and Project-Context.md Sections 1, 5, and 9 before doing anything.

Create the Supabase database layer:
1. Write /supabase/schema.sql containing full DDL for every table in PRD.md Section 6, exactly as named and structured there (snake_case, exact field names — do not rename or add fields not listed). Use appropriate Postgres types (uuid primary keys with default gen_random_uuid(), text, numeric for money fields, timestamptz for created_at, text[] for tag/amenity arrays). Add foreign key constraints matching the relationships implied (listings.seller_id -> users.id, listings.campus_id -> campuses.id, conversations.listing_id -> listings.id nullable, conversations.room_id -> rooms.id nullable, etc).
2. Write /supabase/rls.sql with Row Level Security policies:
   - Users can read all public listings/rooms/roommate_profiles (public browse)
   - Users can insert/update/delete only their own listings, rooms, roommate_profiles
   - Users can read conversations and messages only where they are a member (via conversation_members)
   - Users can insert messages only into conversations they are a member of
   - Users can read/update only their own users row
3. Update /lib/types.ts to match the finalized schema exactly (replace the Phase 0 stubs with accurate field types).
4. Do not write seed data yet — that's a separate step later.

Explain briefly what RLS policies were written and why, then stop.
```

**✅ Checkpoint:** Run schema.sql + rls.sql in Supabase SQL editor with no errors; types.ts matches schema field-for-field.

---

## Phase 3 — Auth Prompt

**Goal:** Login works, session persists, demo accounts are usable without depending on live email delivery during judging.

```
Read Project-Context.md Section 5 (Auth & Roles Convention) before doing anything.

Build authentication:
1. Build /app/login/page.tsx — simple, clean login form (email input) using Supabase Auth. Support magic link / OTP as the real flow, but structure the page so a "Continue as Demo Student" button is also visible, which logs in with one of the pre-seeded demo accounts without requiring email delivery — this is critical so the live demo doesn't depend on receiving real emails while judges watch.
2. Create a Supabase server-side session check helper in /lib/supabase/server.ts (if not already sufficient from Phase 0) so pages can check `const user = await getUser()` server-side and redirect to /login if not authenticated.
3. Protect all routes except /login behind this check.
4. Build a minimal /app/profile/page.tsx showing the logged-in user's name, email, campus, and a logout button. Nothing more yet — full profile polish comes later if time allows.
5. Add a "campuses" row seed value mentally (don't write seed.sql yet, just make sure the schema/flow supports one campus called "Demo Campus" that demo accounts belong to).

Stop after auth works end to end: a demo account can log in, land on a protected page, and log out.
```

**✅ Checkpoint:** Can log in via demo button, land on a protected page, refresh without losing session, log out successfully.

---

## Phase 4 — Rent Engine Prompt

**Goal:** The core calculation logic exists as pure, tested-by-hand functions before any UI touches it — matches Project-Context.md Section 6 exactly.

```
Read PRD.md Section 4 and Section 6, and Project-Context.md Section 6 before doing anything.

Build /lib/rent-engine.ts with these pure functions (no Supabase calls inside):
1. calculateSplit(totalRent: number, utilities: number, maintenance: number, occupants: number): number — returns per-person share.
2. calculateHousingRatio(perPersonShare: number, monthlyIncome: number): number — returns a percentage.
3. getAffordabilityFlag(percentage: number): "comfortable" | "moderate" | "high" | "heavy" — using named constants for the thresholds (0-30 comfortable, 30-40 moderate, 40-50 high, 50+ heavy), not magic numbers inline.

Also write 4-5 inline test cases as simple console.log assertions (or a quick /app/rent-test/page.tsx scratch page) proving the functions work correctly for realistic numbers (e.g. rent 18000 + utilities 1500 + maintenance 900 split 3 ways, against income 15000, should land in a specific flag bucket). Show me the output so we can sanity check the math before building the UI around it.

Do not build any Rent Health UI page yet — that comes later, this step is logic only.
```

**✅ Checkpoint:** Manually verify 2-3 calculations by hand against the console output — math is correct.

---

## Phase 5 — Marketplace Pages Prompt

**Goal:** Full marketplace loop — browse, search, filter, view detail, create listing.

```
Read PRD.md Sections 4, 6, 7 (Flow A) and Project-Context.md Sections 2, 4, 5 before doing anything.

Build the marketplace feature:
1. /components/marketplace/ListingCard.tsx — image, title, price, category badge, condition, location label. Uses the shared card style from the design system.
2. /components/marketplace/CategoryFilter.tsx — filter chips/tabs for category and type (buy/sell/rent).
3. /app/marketplace/page.tsx — grid of ListingCards, search bar (filters by title/description via Postgres ILIKE per Project-Context.md search convention), CategoryFilter wired in, LoadingSkeleton while fetching, EmptyState if no results.
4. /components/marketplace/ListingForm.tsx — form for title, description, price, category, type (buy/sell/rent), condition, location label, and image upload (Supabase Storage) with a URL-paste fallback field per PRD Risk Log.
5. /app/marketplace/new/page.tsx — uses ListingForm, this is the "Seller mode" listing creation page, saves to Supabase, redirects to the new listing's detail page on success, shows a toast confirmation.
6. /app/marketplace/[id]/page.tsx — full listing detail: images, description, price, seller info, and an "I'm Interested / Message Seller" button.
7. Wire the "I'm Interested" button to the conversation auto-creation logic — for now, if /lib/conversations.ts doesn't exist yet, create it with a getOrCreateConversation(listingId, buyerId, sellerId) function per PRD Flow A and Project-Context.md Section 7, and have the button call it then redirect to /messages/[conversationId]. (Full chat UI comes in a later step — this just needs to create the conversation row and members correctly.)

Add a mode toggle (Buyer/Seller) per Project-Context.md Section 5 — a simple UI toggle (query param or local state, not a DB field) that changes whether the marketplace page emphasizes "Browse" or shows a prominent "+ New Listing" CTA.

Stop and report what was built.
```

**✅ Checkpoint:** Can create a listing, see it appear in the browse grid, search/filter works, clicking "Interested" creates a conversation row in Supabase.

---

## Phase 6 — Housing & Roommates Pages Prompt

**Goal:** Housing browse/post loop, plus simple roommate filtering — no scoring engine, per PRD Section 3.

```
Read PRD.md Sections 4, 6, 7 (Flow B) and Project-Context.md Sections 2, 4, 5, 7 before doing anything.

Build the housing feature:
1. /components/housing/RoomCard.tsx — image/placeholder, title, rent, occupancy (filled/total), amenities badges, location label.
2. /components/housing/RoomForm.tsx — title, rent, utilities, maintenance, bedrooms, occupancy_total, amenities (multi-select tags), location label, available_from date.
3. /app/housing/page.tsx — grid of RoomCards with simple filters (budget range, location, move-in month) — plain filtering, no weighted scoring per PRD Section 3.
4. /app/housing/new/page.tsx — uses RoomForm, saves to Supabase, this is a "Seller/Lister mode" page (owner posting a room), toast + redirect on success.
5. /app/housing/[id]/page.tsx — full room detail: amenities, rent breakdown preview, occupancy status, and an "I'm Interested" button.
6. Wire "I'm Interested" to getOrCreateConversation, but for the room case: type = "housing_group", room_id = this room. If a housing_group conversation already exists for this room_id, add the current user as a new conversation_member (role: prospective_roommate) instead of creating a duplicate conversation — this is what makes it automatically become a group chat the moment a second person joins, per PRD Flow B. Redirect to /messages/[conversationId] after joining.
7. /app/roommates/page.tsx — grid of roommate_profiles with simple filters (budget range, preferred_location, move_in_month) — again, plain filtering only, explicitly no weighted matching algorithm.
8. A simple form (can live inline on /app/roommates/page.tsx or a small modal) letting a logged-in user create/edit their own roommate_profile (budget_min, budget_max, preferred_location, move_in_month, lifestyle_tags).

Stop and report what was built. Confirm the housing_group conversation logic correctly reuses one conversation row per room rather than creating duplicates.
```

**✅ Checkpoint:** Two different demo accounts clicking "Interested" on the same room land in the *same* conversation thread — verify in Supabase that only one conversation row exists per room_id.

---

## Phase 7 — Chat / Messages Pages Prompt

**Goal:** Real-time (or fallback-polling) chat UI, working for both conversation types from one component tree, per Project-Context.md Section 7.

```
Read PRD.md Section 6, Section 7 (Flows A & B), and Project-Context.md Section 7 before doing anything.

Build the chat feature:
1. /components/chat/ConversationList.tsx — list of the logged-in user's conversations (via conversation_members), showing: for marketplace_dm type, the listing title + other member's name; for housing_group type, the room title + member count + avatars. Sort by most recent message.
2. /components/chat/MessageThread.tsx — renders messages for a given conversation_id, sender name/avatar, timestamp, styled distinctly for "my messages" vs others. Must work identically whether the conversation has 2 members or more — no separate group-chat variant.
3. /components/chat/MessageInput.tsx — text input + send button, inserts into messages table.
4. /app/messages/page.tsx — renders ConversationList, click-through to a thread.
5. /app/messages/[conversationId]/page.tsx — renders MessageThread + MessageInput for that conversation, plus a small context header (shows the linked listing or room card in miniature at the top, so the chat always has context of what it's about).
6. Wire Supabase Realtime: subscribe to postgres_changes on the messages table filtered by conversation_id, so new messages appear live without refresh. Structure the data-fetching so that if Realtime setup is problematic, it can be swapped for a 3-second setInterval poll on the same query without changing the UI component — per Project-Context.md Section 7 fallback plan. Try Realtime first.
7. Test the flow: open the same conversation in two different browser sessions (or an incognito window as a second demo user) and confirm a message sent in one appears in the other without a manual refresh.

Stop and report what was built, and confirm whether Realtime worked or the polling fallback was needed.
```

**✅ Checkpoint:** Two-tab test works — message sent in Tab A appears in Tab B live. Group conversation (3+ members from Phase 6) renders correctly in the same MessageThread component.

---

## Phase 8 — Rent Health Page Prompt

**Goal:** The standalone calculator page, plus the pre-filled version launched from a room, using the Phase 4 engine.

```
Read PRD.md Sections 4, 6, 7 (Flow C) and Project-Context.md Sections 4, 6 before doing anything.

Build the Rent Health feature:
1. /components/rent/RentHealthForm.tsx — inputs for monthly income (optional), rent, utilities, maintenance, number of roommates. If launched with a room_id in the query string, pre-fill rent/utilities/maintenance/occupants from that room's data.
2. /components/rent/AffordabilityBadge.tsx — colored badge using the flag-comfortable/moderate/high/heavy theme tokens from Phase 1, showing the flag level in plain language (e.g. "🟢 Comfortable").
3. /components/rent/RentHealthResult.tsx — shows total cost, per-person share, housing ratio %, and the AffordabilityBadge, using calculateSplit/calculateHousingRatio/getAffordabilityFlag from /lib/rent-engine.ts. Include a one-line human sentence under the result (e.g. "This accommodation is affordable, but your monthly buffer is relatively limited.") that changes based on the flag level.
4. /app/rent/page.tsx — renders RentHealthForm + RentHealthResult, works standalone (no room_id) or pre-filled (?room=<id> query param, matching the launch-from-room-chat flow in PRD Flow C).
5. Optionally save the calculation to the rent_splits table when the user calculates (not required for it to function, but nice for a "history" feel if time allows — don't block on this).
6. Add a small "Calculate Rent Health" link/button inside the room detail page (Phase 6) and inside a housing_group conversation's context header (Phase 7) that deep-links to /rent?room=<id>, per Flow C.

Stop and report what was built. Test with at least 3 different input combinations to confirm all 4 flag levels can be reached and display correctly.
```

**✅ Checkpoint:** All 4 flag colors/messages reachable with realistic test inputs; pre-fill from a room works; deep link from chat context header works.

---

## Phase 9 — Dashboard Page Prompt

**Goal:** The homepage that ties everything together and sets the tone for the demo's first 10 seconds.

```
Read PRD.md Sections 1, 4, 10 (Demo Script step 1) and Project-Context.md Section 4 before doing anything.

Build /app/page.tsx as the CampusLoop dashboard/home:
1. Welcome header with the user's name and campus.
2. Search bar (shortcuts to marketplace search).
3. Three quick-access cards/buttons: Housing, Marketplace, Roommates (icons, per PRD's original home sketch in spirit — not literal pixel copy).
4. A "Rent Health" snapshot widget: if the user has a saved rent_split (or otherwise show a sample/prompt state), display their current estimated share and ratio with the AffordabilityBadge; if none yet, show an EmptyState prompting them to calculate one, linking to /rent.
5. A "Near You" or "Recently Added" section showing the 4-6 most recent marketplace listings as compact ListingCards.
6. Ensure this page uses LoadingSkeleton while data loads and looks intentional and alive even before seed data is added (test with whatever real data exists from your own testing so far).

This page is what judges see first — make sure it's polished, per PRD Section 9. Stop and report what was built.
```

**✅ Checkpoint:** Dashboard loads fast, looks complete, all quick-access links work, no dead sections.

---

## Phase 10 — Seller/Buyer Mode Polish Prompt

**Goal:** Make the buyer/seller mode distinction (PRD Section 5) feel intentional across the app, not just a single toggle on one page.

```
Read PRD.md Section 5 and Project-Context.md Section 5 before doing anything.

Review and polish the Buyer/Seller mode experience across the app:
1. Confirm the mode toggle from Phase 5 (marketplace) is visually consistent and also present/relevant on the housing pages (Phase 6) — same toggle component reused, not two different ones.
2. When in "Seller/Lister mode", surface "+ New Listing" / "+ List a Room" CTAs prominently (e.g. in the Navbar or as a floating action button).
3. When in "Buyer/Renter mode", emphasize search/filter/browse UI.
4. Add a small "My Listings" / "My Rooms" view (can be a tab on /app/profile/page.tsx) so a seller can see and manage what they've posted — at minimum, list their own listings/rooms with a delete option, using the RLS policies from Phase 2 to enforce it's their own data only.

This is a polish pass, not new architecture — reuse existing components (ListingCard, RoomCard, ListingForm, RoomForm) wherever possible rather than building new ones. Stop and report what was built.
```

**✅ Checkpoint:** Switching modes visibly changes emphasis on both marketplace and housing pages; a seller can view/delete their own listings from profile.

---

## Phase 11 — Full Visual Polish Pass Prompt

**Goal:** This is the "startup, not assignment" pass from PRD Section 9 — run this only once every page above exists and functions.

```
Read PRD.md Section 9 and Project-Context.md Section 4 before doing anything.

Do a full visual polish pass across every page built so far (dashboard, marketplace, marketplace detail/new, housing, housing detail/new, roommates, messages, rent, profile):
1. Confirm consistent spacing, card styles, and typography across every page — fix any page that drifted from the design system.
2. Confirm every async data fetch shows a LoadingSkeleton, not a blank flash.
3. Confirm every list view (marketplace, housing, roommates, messages, my-listings) has a designed EmptyState, not a blank area, when there's no data.
4. Add toast notifications (using the Toast/Sonner component from Phase 1) for every meaningful action: listing created, room posted, message sent, roommate profile saved, rent split calculated.
5. Confirm mobile responsiveness end to end — test at a narrow viewport, confirm BottomNav appears and all pages are usable one-handed.
6. Remove any placeholder text, "Lorem ipsum", "Coming soon", or TODO labels visible anywhere in the UI.
7. Add subtle transitions/animations where they're cheap (hover states on cards, fade-in on page load) — nothing that costs meaningful build time.

Report a page-by-page checklist confirming each of the above is done, and flag anything that couldn't be fixed in time so we know what's still rough for the demo.
```

**✅ Checkpoint:** Walk through every page on both desktop and mobile widths — nothing looks unfinished.

---

## Phase 12 — Seed Data Prompt

**Goal:** The app looks alive before judges ever touch it. (Full seed script will be detailed further in the separate Demo Data file — this is the build-file trigger to run it.)

```
Read PRD.md Section 9 and Project-Context.md Section 8 before doing anything.

Write /supabase/seed.sql with realistic demo data for CampusLoop, using Indian campus/hostel/PG context and INR pricing:
1. 1 campus row ("Demo Campus").
2. 6 demo users belonging to that campus (varied names, avatars optional/placeholder).
3. 20 marketplace listings spread across categories (furniture, electronics, cycles, books, appliances, other) and types (buy/sell/rent), assigned to different demo users as sellers, with realistic titles/prices/conditions/location labels.
4. 8 rooms with varied rent/utilities/bedrooms/occupancy/amenities/location labels, assigned to different demo users as owners.
5. 10 roommate_profiles with varied budget ranges, preferred locations, move-in months, lifestyle tags, linked to demo users.
6. 5 conversations: at least 2 marketplace_dm (linked to real seeded listings, 2 members each) and at least 2 housing_group (linked to real seeded rooms, 2-3 members each, to demonstrate the group-chat-forms-automatically story), each with 3-5 realistic seeded messages.
7. A couple of rent_splits rows so the dashboard's Rent Health snapshot (Phase 9) has real data to show for at least one demo account.

Run this seed file against the Supabase project and confirm every page (dashboard, marketplace, housing, roommates, messages) now shows populated, realistic-looking data instead of empty states. Report what was seeded.
```

**✅ Checkpoint:** Every page looks "alive" — no empty states visible when browsing as a demo account (unless intentionally demonstrating one, e.g. "My Listings" for a user who hasn't posted).

---

## Phase 13 — End-to-End Test & Demo Rehearsal Prompt

**Goal:** Final pass before presenting — run the exact demo script from PRD Section 10 and fix anything broken.

```
Read PRD.md Section 10 (Demo Script) and Section 12 (Success Criteria) before doing anything.

Run the full demo flow exactly as written in PRD.md Section 10, step by step, as if you were demoing to judges:
1. Login → Dashboard
2. Search marketplace ("cycle" or similar seeded item) → open listing → message seller → confirm realtime works across two sessions
3. Browse housing → open a room with an existing seeded interested user → click Interested → confirm you land in a group thread with that user already present
4. From that room/chat, launch Rent Health pre-filled → confirm split + affordability flag display correctly
5. Toggle to Seller mode → post a new listing live → confirm it appears in the marketplace grid immediately
6. Check every page one more time for dead buttons, console errors, or broken links

Report the outcome of each step (pass/fail), and for anything that fails, fix it now before we consider the build complete. Confirm PRD.md Section 12's Success Criteria checklist is fully satisfied at the end.
```

**✅ Checkpoint:** Full demo script runs twice without a hitch. This is the last step before presenting.

---

## Notes on Using This Staircase

- **Don't run steps out of order** — later prompts assume earlier components/tables/functions already exist (e.g. Phase 5-8 all depend on Phase 2's schema and Phase 1's design system).
- **If time runs critically short**, per PRD Section 4's priority list, it is safe to stop after Phase 9 (Dashboard) with Phases 5-9 solid, and compress Phases 10-11 into a lighter pass, but **never skip Phase 12 (Seed Data) or Phase 13 (Test)** — an empty or broken app loses regardless of feature count.
- **Deployment** (Vercel + GitHub, per Project-Context.md Section 1) should happen incrementally from Phase 0 onward — don't save first deploy for the end; push and confirm the live URL works after Phase 3 (Auth) at the latest, then keep deploying as you go so there's never a "does it even build" surprise near 6:30am.

---
*Next file (separate, per your instruction): Demo Data / Seed reference file — a standalone expanded version of Phase 12's seed content, kept separate so it can be grabbed and run independently under time pressure.*
