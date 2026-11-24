# 🎓 CampusLoop — Unified Campus Living Platform

> **Live Demo:** [https://campusloop-blue.vercel.app](https://campusloop-blue.vercel.app)

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Realtime-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://campusloop-blue.vercel.app)

---

## 🌟 Overview

Students don't have separate isolated problems—they have a unified **campus-living problem**. Finding housing leads to forming roommate groups, roommate groups need transparent rent splitting, moving in/out creates a marketplace for second-hand student items, and every step requires immediate peer-to-peer communication.

**CampusLoop** brings this student lifecycle together in one web platform:
1. 🛍️ **Hyper-Local Marketplace**: Buy, sell, or rent student essentials (cycles, mattresses, study tables, kettles, notes).
2. 🏠 **Housing & Flat Finder**: Discover 1BHK/2BHK flats, PGs, and hostel rooms with transparent rent breakdowns.
3. 👥 **Roommate Matcher**: Connect with fellow students filtered by budget, campus proximity, and lifestyle habits.
4. 📊 **Rent Health Calculator**: Equal cost sharing algorithm + student allowance affordability index (🟢 Comfort, 🟡 Balanced, 🟠 Heavy, 🔴 At Risk).
5. 💬 **Unified Realtime Chat**: Seamless auto-created 1:1 buyer↔seller direct messages and housing roommate group threads.

---

## 🚀 Key Features

### 🛍️ 1. Hyper-Local Campus Marketplace
- **Search & Filters**: Filter by category (*Electronics, Cycles, Study & Books, Furniture, Appliances*), condition (*Like New, Good, Fair*), and listing type (*Sell, Buy, Rent*).
- **1-Click Listing Creation**: Upload photos, set price, condition, and campus location label with instant client sync.
- **Buyer & Seller Mode**: Toggle contextual interface modes depending on whether you're browsing items or managing active listings.

### 🏠 2. Student Housing & Room Finder
- **Transparent Listings**: Detailed breakdown of Base Rent, Maintenance, and Utilities per unit.
- **Occupancy Tracking**: Displays total vs. filled spots (e.g. *2 of 3 spots filled*).
- **Auto-Group Room Inquiries**: Clicking "I'm Interested" automatically joins/creates a shared housing group thread with the host and fellow prospective roommates.

### 📊 3. Rent Health & Affordability Engine
- **Per-Person Split**: Computes exact equal split across rent, maintenance, and utility bills.
- **Housing Ratio Index**: Flags financial stress based on monthly student stipend/allowance:
  - 🟢 **Safe & Comfortable (≤ 30%)**: Budget leaves plenty of room for food, study, and recreation.
  - 🟡 **Balanced (31% - 40%)**: Standard manageable student range.
  - 🟠 **Heavy (41% - 50%)**: Strained monthly budget; caution advised.
  - 🔴 **At Risk (> 50%)**: High financial burden for a student allowance.
- **Contextual In-Room Pre-fill**: Launch calculations directly from any room listing with all parameters pre-populated.

### 💬 4. Unified Realtime Chat System
- **Single Conversation Architecture**: A unified backend table powering both 1:1 marketplace buyer-seller direct messages and multi-student housing group chats.
- **Context Banners**: Active item listing card and room details pinned directly into the chat header.
- **Instant Messaging**: Realtime database subscriptions for instant messaging updates with zero latency.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: [Next.js 14 (App Router)](https://nextjs.org/), [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/), [Sonner Toasts](https://sonner.emilkowal.ski/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Realtime Subscriptions)
- **Deployment**: [Vercel](https://vercel.com/) (Continuous Deployment from GitHub)

---

## 📂 Project Structure

```bash
campusloop/
├── app/
│   ├── housing/               # Housing listings & detail pages
│   │   ├── [id]/page.tsx      # Room view with group inquiry CTA
│   │   └── new/page.tsx       # List a new flat / PG
│   ├── marketplace/           # Marketplace listings & details
│   │   ├── [id]/page.tsx      # Item details with 1:1 chat initiator
│   │   └── new/page.tsx       # Post a new item
│   ├── messages/              # Realtime Unified Chat
│   │   └── [conversationId]/  # Direct Message & Group Chat threads
│   ├── rent/                  # Rent Health & Affordability Calculator
│   ├── roommates/             # Roommate finder directory
│   ├── profile/               # User profile & my active listings
│   ├── layout.tsx             # Global layout, Navbar, and Providers
│   └── page.tsx               # Modern dynamic landing dashboard
├── components/
│   ├── housing/               # RoomCard, HousingFilters, OccupancyBadge
│   ├── marketplace/           # ListingCard, CategoryFilter
│   ├── rent/                  # RentCalculator, AffordabilityBadge
│   ├── chat/                  # ChatBox, ChatList, MessageBubble
│   └── shared/                # Navbar, ModeToggle, ThemeToggle, Skeletons
├── lib/
│   ├── auth.ts                # Auth session & demo student profiles
│   ├── rent-engine.ts         # Rent split & financial health engine
│   ├── marketplace-data.ts    # Seeded marketplace data
│   ├── housing-data.ts        # Seeded housing & flat data
│   └── supabase.ts            # Supabase client & realtime configuration
└── supabase/
    └── seed.sql               # Database schema, RLS policies, seed records
```

---

## ⚙️ Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/AstroSalik/campusloop.git
cd campusloop
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
*(Note: CampusLoop features built-in robust offline mock fallbacks with rich seeded campus data if external Supabase credentials are not provided).*

### Account verification

1. In the matching Supabase project's SQL Editor, run [the account verification SQL](supabase/account-verification.sql). Keep the service role key on the server. Previous profile flags and Aadhaar submissions do not carry forward as verified results.
2. Deploy the code with `SETU_AADHAAR_MODE=disabled`. Then run [the account access hardening SQL](supabase/account-access-hardening.sql) after the base schema and earlier patches. This order lets the secured API take over chat writes before browser write permissions are removed. Check signed-in messages, listing management and notifications on that release.
3. Test Aadhaar using a Setu sandbox instance with an HTTPS preview or staging origin. Set `SETU_AADHAAR_MODE=sandbox`, use separate sandbox credentials, and set the callback to `<staging-origin>/api/kyc/return`. Only use provider test data in this environment. Sandbox success grants no identity badge.
4. Ask Setu to approve the optional CampusLoop identity-check use case and confirm the applicable UIDAI authorization, permitted data fields, consent and retention terms. Enable production only after that approval and a successful sandbox test. [Setu eKYC guide](https://docs.setu.co/data/ekyc/quickstart) · [UIDAI regulations](https://uidai.gov.in/en/regulations)

For production, add these values under the CampusLoop Vercel project’s **Settings → Environment Variables → Production**. Store provider credentials as secrets.

| Variable | Production value |
| --- | --- |
| `VERIFICATION_APP_ORIGIN` | `https://campusloop-blue.vercel.app` or the confirmed production origin, without a trailing slash |
| `SETU_CLIENT_ID` | Setu production client ID |
| `SETU_CLIENT_SECRET` | Setu production client secret |
| `SETU_PRODUCT_INSTANCE_ID` | Approved Setu production eKYC product instance ID |
| `SETU_AADHAAR_MODE` | `production` after approval and sandbox testing |
| `SETU_AADHAAR_PRODUCTION_APPROVED` | `true` after Setu approves CampusLoop's production use case |

Register `https://campusloop-blue.vercel.app/api/kyc/return` as the production callback if that remains the production origin. Deploy with the new settings, then confirm an authorized test user can complete the provider flow and sees the result only on their own profile. For rollback, set the mode back to `disabled` and redeploy. [Vercel environment variable guide](https://vercel.com/docs/environment-variables/managing-environment-variables)

Campus email is configured separately. Set `CAMPUS_VERIFICATION_DOMAINS` to a comma-separated list of approved inbox domains. Configure a Resend key and a verified sender in `EMAIL_FROM` and generate a random, server-only `CAMPUS_VERIFICATION_SECRET` (for example, `openssl rand -hex 32`). Campus email confirmation shows control of an approved inbox.

Verification is optional. A successful Aadhaar check confirms identity. Proof of current enrollment requires institution-issued evidence. The app never stores provider-returned identity documents or OTPs. Before launch, review and remove legacy Aadhaar metadata left by the previous flow from Supabase, including `public.users.aadhaar_last4` and the legacy `aadhaar_name` and `aadhaar_last4` Auth user metadata. Review applicable retention requirements before deleting data.

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to explore the application.

---

## 🧪 Available Scripts

- `npm run dev` — Starts the local Next.js development server.
- `npm run build` — Builds the optimized production application.
- `npm run start` — Runs the compiled production build.
- `npm run lint` — Executes ESLint checks across the codebase.

---

## 👥 Demo Credentials & Seed Data

The platform comes pre-configured with realistic campus data:
- **Default Active Campus**: Demo Campus (Sopore / Phagwara)
- **Active Demo User**: `Salik (CSE '26)` — `salik@demo.campusloop.in`
- **20+ Seeded Marketplace Listings**: Cycles, Study Tables, Induction Cookers, Engineering Textbooks.
- **8+ Verified Accommodations**: 1BHK, 2BHK, 3BHK flats and PG rooms with active roommate groups.

---

## 📄 License

This project is open-source and built for student campus communities. Distributed under the MIT License.
