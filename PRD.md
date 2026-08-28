# CampusLoop — Product Requirements Document (PRD)

**Status:** Locked for build | **Timebox:** 7 hours | **Version:** 1.0
**Prepared for:** Antigravity build guide (single source of truth — do not deviate mid-build)

---

## 1. One-Line Pitch

> Students don't have an e-commerce problem or a rent-splitting problem — they have a **campus-living problem**. CampusLoop is the one place to find housing, find roommates, split rent fairly, and buy/sell everything in between — with chat built in from the first click.

## 2. Problem Statements Being Solved (mandated scope)

| # | Source Problem | Category |
|---|---|---|
| 11 | Local Marketplace for Hostel/PG Students — buy/sell/rent listings, categories, search, in-app chat | E-Commerce |
| 35 | Rent Affordability & Roommate Cost Splitter — enter rent/utilities/roommates, compute fair split, flag if rent exceeds income % | Real Estate |

**Merge thesis:** Housing search creates roommate groups → roommate groups need rent splitting → students moving in/out generate marketplace listings → all of it requires chat. One connected loop, one login, one campus.

## 3. Explicit Non-Goals (DO NOT BUILD — read this before every feature decision)

To protect the 7-hour timebox, the following are **out of scope**, full stop, regardless of how much time feels "left over":

- ❌ Real payments, escrow, KYC
- ❌ Google Maps / geolocation integration
- ❌ Native mobile apps (web/PWA only)
- ❌ Push notifications
- ❌ AI recommendation engine or AI as a core feature (one optional AI touch at most, added last, only if ahead of schedule)
- ❌ Weighted/scored roommate matching algorithms — use simple filters only
- ❌ Room-attribute-based unequal rent splitting (size/AC/balcony weighting) — equal split + manual override only
- ❌ Presence indicators ("online now")
- ❌ Admin analytics dashboards
- ❌ Custom WebSocket infrastructure (Supabase Realtime only)

If a feature isn't in Section 4, it doesn't get built before the demo.

## 4. Core Features (mandatory, in priority order)

### P0 — Must work flawlessly for the demo
1. **Auth** — simple email login (seeded demo accounts, one "Demo Campus")
2. **Marketplace** — create listing (title, description, price, category, buy/sell/rent, condition, campus location, images), browse/search, category + type filters, listing detail page
3. **Unified Chat** — auto-created the moment a user expresses interest (see Section 6 data model); supports both 1:1 (marketplace buyer↔seller) and group (housing) conversations from the same table
4. **Rent Health Calculator** — enter rent, utilities, maintenance, roommates, income → equal per-person split, housing-ratio %, color-coded affordability flag (🟢🟡🟠🔴)

### P1 — Build if P0 is solid, still required for "complete" story
5. **Housing listings** — post/browse rooms/PGs with rent, occupancy, amenities
6. **Roommate finder** — simple filter (budget range, location, move-in month) — no scoring engine
7. **Buyer/Seller mode toggle** — distinct UI context: "I want to buy/rent" vs "I want to sell/list" (see Section 7)

### P2 — Only if ahead of schedule (nice-to-have, cut without guilt)
8. Manual override on rent split (drag/adjust per-person share away from equal)
9. One polished "Ask CampusLoop" AI search-to-filter box
10. Saved/favorited listings

## 5. User Roles & Modes

The app has **one account type** (student), but **two explicit modes** in the UI, chosen contextually, not as separate logins:

- **Buyer/Renter mode** — browsing marketplace & housing, expressing interest, chatting, calculating what they'd pay
- **Seller/Lister mode** — posting listings (items or rooms), managing their own listings, responding to interested users

A user can switch modes freely (e.g. bottom nav or toggle) — someone selling a mattress today may be searching for a room tomorrow.

## 6. Data Model (authoritative — build exactly this, do not redesign mid-project)

```
users
 ├── id, name, email, campus_id, avatar, monthly_income (optional, for Rent Health)

campuses
 ├── id, name, city

listings                          -- marketplace items
 ├── id, seller_id, campus_id, title, description, category,
 ├── type (buy|sell|rent), price, condition, location_label, status, created_at

listing_images
 ├── id, listing_id, image_url

rooms                             -- housing listings
 ├── id, owner_id, campus_id, title, rent, utilities, maintenance,
 ├── bedrooms, occupancy_total, occupancy_filled, amenities[], location_label,
 ├── available_from, status

roommate_profiles                 -- for the finder, not a matching engine
 ├── id, user_id, budget_min, budget_max, preferred_location, move_in_month, lifestyle_tags[]

conversations                     -- ONE table for all chat types
 ├── id, listing_id (nullable), room_id (nullable),
 ├── type (marketplace_dm | housing_group), created_at

conversation_members
 ├── conversation_id, user_id, role (seller|buyer|owner|prospective_roommate)

messages
 ├── id, conversation_id, sender_id, content, created_at

rent_splits
 ├── id, room_id (nullable — can be standalone calc), total_rent, utilities,
 ├── maintenance, occupants, per_person_share, income_used, housing_ratio_pct, flag_level
```

## 7. Key Interaction Flows

### Flow A — Marketplace purchase interest → chat
1. Buyer views listing → clicks "I'm Interested / Message Seller"
2. System checks: does a `marketplace_dm` conversation exist for (listing_id, buyer_id, seller_id)? If not, create it + add both as members
3. Redirect to chat thread, pre-filled with listing card context

### Flow B — Room interest → auto group chat
1. Student views room listing → clicks "I'm Interested"
2. System checks: does a `housing_group` conversation exist for this `room_id`? If not, create it with the owner as a member
3. Student added as `prospective_roommate` member
4. **The moment a second interested student joins, it's already a group chat** — no separate logic needed, same table, same thread
5. Any member can trigger Rent Health calc from within that room's context (pre-fills rent/utilities/occupant count)

### Flow C — Rent Health (standalone or from a room)
1. User enters income (optional), rent, utilities, maintenance, roommate count
2. System computes equal split, housing ratio %, flag
3. If launched from a room's group chat, occupant count and rent auto-fill from `rooms`; result can be shared back into the chat

## 8. Tech Stack (locked — do not re-litigate mid-build)

- **Frontend:** Next.js + React + TypeScript + Tailwind + shadcn/ui + lucide icons
- **Backend:** Supabase (Postgres + Auth + Storage + Realtime + RLS) — no separate backend server
- **Hosting:** Vercel, connected to GitHub for auto-deploy
- **Chat:** Supabase Realtime (database change subscriptions) — no custom WebSocket server
- **Images:** Supabase Storage, compressed uploads

## 9. Design & Polish Requirements (judges notice this more than feature count)

- Consistent spacing/typography system (pick once, reuse everywhere)
- Skeleton loaders for async data — never show a raw blank screen
- Empty states designed, not left blank ("No listings yet — be the first to post")
- Toast notifications for actions (listing posted, message sent, split calculated)
- Fully responsive; mobile bottom nav
- Seeded, realistic demo data — **never demo an empty app** (target: 20 marketplace listings, 8 rooms, 10 roommate profiles, 5 live conversations before demo)
- Zero dead buttons, zero "Coming soon" labels visible anywhere

## 10. Demo Script (rehearse before 6:30am)

1. Login → Dashboard (shows Rent Health snapshot + nearby listings)
2. Search marketplace ("cycle") → open listing → message seller → **switch browser tab, show live realtime reply**
3. Browse housing → open a room → click Interested → show it lands in a group thread with an existing prospective roommate already there
4. From that room, launch Rent Health pre-filled → show split + affordability flag
5. Toggle to Seller mode → post a new listing live, show it appear in marketplace instantly
6. Close on the pitch line (Section 1) + one-line business model (Section 11)

## 11. Business Model (one-liner for judge Q&A — do not build any of this)

Free for students to build campus network density → verified housing listings (landlords pay) → promoted marketplace listings (sellers pay to boost) → small transaction fee once escrow is added post-hackathon → campus/PG-operator partnerships.

## 12. Success Criteria for "Done"

- [ ] All P0 features work end-to-end with zero broken flows
- [ ] Chat auto-creation works for both 1:1 and group cases from the same table/logic
- [ ] Rent Health flag colors correctly for at least 3 test scenarios (low/moderate/high ratio)
- [ ] App is seeded with realistic data, looks "alive" on first load
- [ ] Deployed live URL works on a phone with zero install
- [ ] Demo script (Section 10) run at least twice without a hitch before presenting

## 13. Risk Log (check before each build phase)

| Risk | Mitigation |
|---|---|
| Realtime chat eats too much time | Fall back to polling every 3s if Supabase Realtime setup stalls past 45 min |
| RLS policies block your own demo | Write and test RLS early (Phase: DB+Auth), not at the end |
| Image upload flakiness under time pressure | Allow image URL paste as a fallback input, don't block on Storage working perfectly |
| Scope creep from P2 ideas | Re-read Section 3 before adding anything not already listed |

---
*This PRD is the locked reference for the Project Context file and System Build file that follow. Any change to scope during the build must be reflected here first.*
