# CampusLoop — Project Context

**Purpose of this file:** This is the standing reference Antigravity should hold in context on every build step alongside the PRD. The PRD says *what* to build and *why*. This file says *how* — stack setup, conventions, folder structure, naming, and guardrails so every generated file is consistent with every other one. If a build prompt ever conflicts with this file, this file wins.

---

## 1. Tech Stack (exact versions/choices — do not substitute)

- **Framework:** Next.js (App Router, not Pages Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components + lucide-react icons
- **Backend/DB:** Supabase (Postgres + Auth + Storage + Realtime + RLS) — accessed via `@supabase/supabase-js` and `@supabase/ssr` for server/client helpers
- **Hosting:** Vercel, auto-deploy from GitHub `main` branch
- **Package manager:** npm (don't mix with yarn/pnpm mid-project)
- **No custom backend server.** No Express, no Python service, no separate API layer beyond Next.js route handlers where Supabase calls need to be server-side (e.g. protected mutations).

## 2. Folder Structure (create exactly this, keep it flat where possible)

```
/app
  /layout.tsx
  /page.tsx                       -- Dashboard
  /login/page.tsx
  /marketplace/page.tsx
  /marketplace/[id]/page.tsx
  /marketplace/new/page.tsx       -- create listing (seller mode)
  /housing/page.tsx
  /housing/[id]/page.tsx
  /housing/new/page.tsx
  /roommates/page.tsx
  /rent/page.tsx                  -- Rent Health calculator
  /messages/page.tsx              -- conversation list
  /messages/[conversationId]/page.tsx
  /profile/page.tsx
/components
  /ui/                            -- shadcn generated components live here, don't hand-edit unless necessary
  /shared/                        -- Navbar, BottomNav, EmptyState, LoadingSkeleton, Toast wrapper
  /marketplace/                   -- ListingCard, ListingForm, CategoryFilter
  /housing/                       -- RoomCard, RoomForm
  /chat/                          -- ConversationList, MessageThread, MessageInput
  /rent/                          -- RentHealthForm, RentHealthResult, AffordabilityBadge
/lib
  /supabase/client.ts             -- browser client
  /supabase/server.ts             -- server client (route handlers, server components)
  /rent-engine.ts                 -- pure TS functions, no side effects (see Section 6)
  /types.ts                       -- shared TypeScript types mirroring the DB schema
/supabase
  /schema.sql                     -- full DDL, source of truth for DB structure
  /seed.sql                       -- demo data (or seed script, see Section 8)
  /rls.sql                        -- row level security policies, kept separate for clarity
```

Do not invent alternate folders (no `/features`, no `/modules`) — keep it matching this tree so every build step knows exactly where its output goes.

## 3. Naming Conventions

- **Files/folders:** kebab-case (`listing-card.tsx`), except Next.js special files (`page.tsx`, `layout.tsx`)
- **React components:** PascalCase (`ListingCard`, `RentHealthResult`)
- **DB tables/columns:** snake_case, exactly as written in PRD Section 6 — never rename or "improve" a field name mid-build
- **TypeScript types:** PascalCase, named to match table singular (`Listing`, `Room`, `Conversation`, `Message`)
- **Branch/commit convention (if using git during the hackathon):** not critical for a 7-hour build — commit directly to `main`, small frequent commits with plain messages (`add rent engine`, `wire chat realtime`)

## 4. Design System (lock these choices immediately, reuse everywhere — no per-page redesigns)

- **Primary color:** deep blue (`#1E3A8A` range) — matches the "startup, not assignment" tone from the PRD
- **Accent/flags:** green `#16A34A` (comfortable), yellow `#CA8A04` (moderate), orange `#EA580C` (high), red `#DC2626` (heavy) — used consistently for Rent Health flags AND nowhere else, so the color always means the same thing
- **Font:** one sans-serif system font stack (Tailwind default `font-sans`) — no custom font loading, it's not worth the setup time
- **Spacing scale:** stick to Tailwind defaults (4/8/12/16/24/32px) — don't hand-roll custom spacing values
- **Cards:** consistent shadcn `Card` component everywhere (listings, rooms, roommate profiles) — same padding, same corner radius, same shadow, across the whole app
- **Icons:** lucide-react only, don't mix icon libraries
- **Loading:** shadcn `Skeleton` component for all async content — never a blank white flash
- **Empty states:** every list view (marketplace, housing, roommates, messages) must have a designed empty state with an icon + one line of copy + a CTA where relevant

## 5. Auth & Roles Convention

- Single Supabase Auth user table, no separate role tables
- "Buyer/Seller mode" (PRD Section 5) is a **UI-level toggle only** — stored in local/session state or a simple query param (`?mode=sell`), NOT a database field, NOT a separate login. Every user can always do both.
- Demo accounts: seed 4–6 fake users under one `campuses` row named `Demo Campus`, pre-verified, no email OTP flow needed for judging (real OTP login can exist, but the demo path should not depend on receiving real emails live)

## 6. Rent Engine Rules (pure functions, testable, no DB calls inside)

Live in `/lib/rent-engine.ts`. Must be pure — input in, number/object out, no Supabase calls inside these functions (fetch data in the page/component, pass plain values in).

```ts
calculateSplit(totalRent, utilities, maintenance, occupants) => perPersonShare
calculateHousingRatio(perPersonShare, monthlyIncome) => percentage
getAffordabilityFlag(percentage) => "comfortable" | "moderate" | "high" | "heavy"
```

Thresholds (from PRD Section 4): 0–30% comfortable, 30–40% moderate, 40–50% high, 50%+ heavy. Keep these as named constants, not magic numbers, so they're easy to tune live if a judge questions the logic.

## 7. Chat Implementation Convention

- One `conversations` table drives both marketplace DMs and housing group chats (PRD Section 6) — **never build a second chat table or a separate group-chat component tree**. The `MessageThread` component must work identically for both types; only membership count differs.
- Realtime: subscribe to `messages` table changes filtered by `conversation_id` using Supabase Realtime channels. If Realtime setup stalls past 45 minutes (per PRD risk log), fall back to a `setInterval` poll every 3 seconds on the same query — same component, just swap the data-fetch mechanism, don't rebuild the UI.
- Conversation auto-creation logic (Flow A / Flow B in PRD) belongs in a single shared helper: `/lib/conversations.ts` → `getOrCreateConversation(...)`, called from both the marketplace listing page and the room listing page, not duplicated.

## 8. Demo Data Convention

- Seed via `/supabase/seed.sql` (plain SQL inserts) — simplest and fastest under time pressure, no need for a scripted seeder
- Target volumes (from PRD Section 9): 20 marketplace listings, 8 rooms, 10 roommate profiles, 5 live conversations with a few messages each
- Use realistic Indian campus-context data (hostel names, PG terminology, INR pricing) to match the source problem statements' framing

## 9. What NOT to Introduce (reinforcing PRD Section 3 at the code level)

- No new npm packages beyond: `@supabase/supabase-js`, `@supabase/ssr`, `next`, `react`, `tailwindcss`, `shadcn` deps, `lucide-react`. Any additional package needs a clear reason tied to a P0/P1 feature — not "this looked useful."
- No custom auth flows beyond Supabase Auth defaults
- No client-side state management library (Redux/Zustand/etc.) — React state + Supabase queries are enough at this scale
- No test suite setup — not worth the time in a 7-hour hackathon; manual demo-flow testing only (PRD Section 10)

## 10. How This File Is Used

Every prompt in the System Build file should assume Antigravity has both the PRD and this Project Context loaded. Build prompts will reference PRD sections for *what*, and should be trusted to follow this file for *how* without needing to restate folder paths or naming rules every time.

---
*Next file: System Build — the staircase of prompts, one per build phase, referencing this file and the PRD throughout.*
