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

**CampusLoop** unifies this entire student lifecycle into one seamless, campus-verified web platform:
1. 🛍️ **Hyper-Local Marketplace**: Buy, sell, or rent student essentials (cycles, mattresses, study tables, kettles, notes).
2. 🏠 **Verified Housing & Flat Finder**: Discover 1BHK/2BHK flats, PGs, and hostel rooms with transparent rent breakdowns.
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
