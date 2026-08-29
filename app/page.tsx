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
      {/* 1. Seamless Blended Hero Section */}
      <div className="relative pt-6 pb-16 lg:pt-12 lg:pb-24 overflow-hidden">
        {/* Subtle background glow/blend */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] opacity-60 dark:opacity-40" />
          <div className="absolute top-32 -right-32 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[120px] opacity-60 dark:opacity-40" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-12">
          <div className="max-w-2xl space-y-8 flex-1">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <span className="text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-4 h-4" />
                {mounted ? `Welcome back, ${currentUser.name.split(" ")[0]} 👋` : "Welcome to CampusLoop"}
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05]" suppressHydrationWarning>
              Your Unified <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
                Campus Hub.
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Buy & sell items, find verified student housing, and calculate transparent rent splits—all in one place designed exclusively for your campus.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
               <Button size="lg" asChild className="rounded-full h-14 px-8 text-base font-bold shadow-lg shadow-primary/25 group">
                 <Link href="/marketplace">
                   Start Exploring
                   <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                 </Link>
               </Button>
               <Button variant="outline" size="lg" asChild className="rounded-full h-14 px-8 text-base font-bold bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                 <Link href="/marketplace/new">
                   Post an Item
                 </Link>
               </Button>
            </div>
            
            {/* Relevant Stats/Trust Indicators */}
            <div className="pt-8 flex items-center gap-8 border-t border-slate-200/60 dark:border-slate-800/60 w-max pr-8">
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">100%</div>
                <div className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Student Verified</div>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">0%</div>
                <div className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Brokerage Fees</div>
              </div>
            </div>
          </div>

          {/* Right side floating UI showcase */}
          <div className="w-full max-w-lg lg:w-[45%] relative z-20 mt-8 lg:mt-0 px-4 sm:px-8 lg:px-0">
             <div className="relative">
                {/* Main showcase image (a cool campus or room photo) */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-3 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2340&auto=format&fit=crop" className="w-full h-64 sm:h-80 lg:h-[340px] object-cover rounded-[1.5rem]" alt="Modern Student Room" />
                  
                  {/* Floating elements simulating app UI */}
                  <div className="absolute -left-4 sm:-left-10 top-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 animate-[bounce_4s_infinite]">
                    <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 sm:p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Verified Flatmate</div>
                      <div className="text-[10px] sm:text-xs text-slate-500">Looking for 1 room</div>
                    </div>
                  </div>
                  
                  <div className="absolute -right-4 sm:-right-8 bottom-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 animate-[bounce_5s_infinite]" style={{ animationDelay: '1s' }}>
                    <div className="bg-primary/15 p-2 sm:p-2.5 rounded-xl text-primary">
                      <Bike className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">₹3,500</div>
                      <div className="text-[10px] sm:text-xs text-slate-500">Listed on campus</div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
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
