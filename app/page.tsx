"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Bike, 
  Building2, 
  CheckCircle2, 
  Compass, 
  Home, 
  MapPin, 
  MessageSquare, 
  Package, 
  Percent, 
  Plus, 
  Search, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles, 
  Store, 
  TrendingUp, 
  Users, 
  Users2, 
  Wallet 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { RoomCard } from "@/components/housing/RoomCard";
import { AffordabilityBadge } from "@/components/rent/AffordabilityBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { getListings } from "@/lib/marketplace-data";
import { getRooms } from "@/lib/housing-data";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";
import { evaluateRentHealth } from "@/lib/rent-engine";
import { useAppMode } from "@/lib/useAppMode";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(PRIMARY_DEMO_USER);
  const [mounted, setMounted] = useState(false);
  const [appMode, setAppMode] = useAppMode();

  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<ReturnType<typeof getListings>>([]);
  const [rooms, setRooms] = useState<ReturnType<typeof getRooms>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const user = getClientDemoSession();
    if (user) {
      setCurrentUser(user);
    }
    const timer = setTimeout(() => {
      setListings(getListings());
      setRooms(getRooms());
      setLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/marketplace");
    }
  };

  // Sample snapshot calculation based on student allowance
  const sampleAssessment = evaluateRentHealth(
    18000,
    1500,
    900,
    3,
    currentUser.monthly_income || 15000
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-8">
      {/* 1. Welcome & Campus Header */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/15 via-slate-50 dark:via-slate-900/80 to-primary/10 border border-primary/20 dark:border-primary/30 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 dark:bg-primary/20 px-2.5 py-0.5 rounded-full border border-primary/20 dark:border-primary/30">
                Active Student
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Demo Campus (Sopore)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white" suppressHydrationWarning>
              Welcome back, {mounted ? currentUser.name.split(" ")[0] : "Student"} 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Your unified campus hub for buying & selling student items, finding verified flats, and calculating transparent rent splits.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-3 shadow-2xs text-center min-w-[100px]">
              <span className="text-xs text-slate-400 font-medium block">Marketplace</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{listings.length || 20} Items</span>
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-3 shadow-2xs text-center min-w-[100px]">
              <span className="text-xs text-slate-400 font-medium block">Flats & PGs</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{rooms.length || 8} Rooms</span>
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-3 shadow-2xs text-center min-w-[100px]">
              <span className="text-xs text-slate-400 font-medium block">Flatmates</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">10 Looking</span>
            </div>
          </div>
        </div>

        {/* 2. Global Search Bar */}
        <form onSubmit={handleSearch} className="mt-6 max-w-2xl relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search cycles, study tables, kettles, books, or 2BHK flats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-24 h-12 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm shadow-xs border-slate-200 focus-visible:ring-primary rounded-xl"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 top-1.5 h-9 px-4 rounded-lg shadow-xs"
          >
            Search
          </Button>
        </form>
      </div>

      {/* 2.5 Quick Options Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Quick Campus Hubs</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({appMode === "seller" ? "Seller / Host Mode" : "Buyer / Renter Mode"})
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {appMode === "seller"
              ? "Options tailored for posting items, listing flats, and managing your student listings."
              : "Options tailored for finding items, discovering flats, and connecting with flatmates."}
          </p>
        </div>

        <ModeToggle
          mode={appMode}
          onModeChange={setAppMode}
          buyerLabel="Buyer / Renter Mode"
          sellerLabel="Seller / Lister Mode"
        />
      </div>

      {/* 3. Three Quick-Access Feature Hub Cards (Dynamically tailored to Buyer vs Seller) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {appMode === "buyer" ? (
          <>
            {/* Buyer Card 1: Marketplace */}
            <Link href="/marketplace" className="group block">
              <Card className="h-full border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/40 dark:hover:border-primary/50">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mt-3 group-hover:text-primary transition-colors">
                    Browse Marketplace
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Find pre-loved cycles, mattresses, calculators, and books from campus peers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary pt-2">
                    <span>Browse {listings.length} Listings</span>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">Student Deals</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Buyer Card 2: Housing */}
            <Link href="/housing" className="group block">
              <Card className="h-full border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/40 dark:hover:border-primary/50">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mt-3 group-hover:text-primary transition-colors">
                    Flats & Hostel Rooms
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Explore verified 1BHK, 2BHK, and 3BHK student flats near campus with transparent rent breakdowns.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary pt-2">
                    <span>Browse {rooms.length} Accommodations</span>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">Auto-Group Chats</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Buyer Card 3: Roommates */}
            <Link href="/roommates" className="group block">
              <Card className="h-full border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/40 dark:hover:border-primary/50">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      <Users2 className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mt-3 group-hover:text-primary transition-colors">
                    Roommate Finder
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Filter verified students by budget range, location preferences, move-in timelines, and habits.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary pt-2">
                    <span>10 Student Profiles</span>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">Connect 1:1</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </>
        ) : (
          <>
            {/* Seller Card 1: Post Listing */}
            <Link href="/marketplace/new" className="group block">
              <Card className="h-full border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
                      <Plus className="h-6 w-6 stroke-[2.5]" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mt-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    + Post Item to Sell/Rent
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    List cycles, study tables, mattresses, electronics, or books for sale to fellow campus students.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-2">
                    <span>1-Click Photo Upload</span>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">Live Campus Reach</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Seller Card 2: List Flat or Room */}
            <Link href="/housing/new" className="group block">
              <Card className="h-full border-blue-200/80 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-white shadow-xs">
                      <Home className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mt-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    + List a Flat, Room or PG
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Have an open spot in your flat or PG? Post room details, rent split breakdown, and auto-group chats.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 pt-2">
                    <span>Transparent Rent Split</span>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">Auto Group Inquiry</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Seller Card 3: Manage My Listings */}
            <Link href="/profile" className="group block">
              <Card className="h-full border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                      <Package className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-amber-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mt-3 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    Manage My Listings & Rooms
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    View active posts, mark items as sold, update pricing/photos, or remove old accommodations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 pt-2">
                    <span>Edit & Delete</span>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">Track Inquiries</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>

      {/* 4. Rent Health Snapshot Widget */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-50/80 dark:from-slate-900 via-white dark:via-slate-900/90 to-primary/[0.02] dark:to-primary/10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
                <Percent className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Rent Health Affordability Snapshot
              </h3>
              <AffordabilityBadge flag={sampleAssessment.flag} percentage={sampleAssessment.housingRatioPct} />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Based on your monthly allowance of <strong>₹{currentUser.monthly_income?.toLocaleString("en-IN") || "15,000"}</strong>, a 3-person flat split (₹18,000 rent + utilities) takes <strong>{sampleAssessment.housingRatioPct}%</strong> of your budget.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-3 shadow-2xs text-center min-w-[120px]">
              <span className="text-[11px] text-slate-400 font-medium block">Est. Monthly Share</span>
              <span className="text-lg font-extrabold text-primary">₹{sampleAssessment.perPersonShare.toLocaleString("en-IN")}</span>
            </div>

            <Button asChild className="shadow-xs">
              <Link href="/rent?room=r01-main-gate-2bhk">
                Launch Full Calculator
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* 5. Recently Added Marketplace Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recently Added on Campus
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest cycles, appliances, and study essentials posted by students.
            </p>
          </div>

          <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/90 text-xs font-semibold gap-1">
            <Link href="/marketplace">
              View All Items
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {listings.slice(0, 4).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {/* 6. Available Housing & Flats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Available Housing & Flats
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Flats with open spots ready for roommate inquiries.
            </p>
          </div>

          <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/90 text-xs font-semibold gap-1">
            <Link href="/housing">
              Explore All Rooms
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.slice(0, 3).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
