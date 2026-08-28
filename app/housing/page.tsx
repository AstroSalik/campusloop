"use client";

import React, { Suspense, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Building2, 
  Clock,
  Home, 
  Info,
  MapPin, 
  Percent, 
  Plus, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Zap,
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RoomCard } from "@/components/housing/RoomCard";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getRooms, getUserActiveInterests, getUserActiveBookings } from "@/lib/housing-data";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";
import { useAppMode } from "@/lib/useAppMode";

function HousingContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useAppMode();
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedBedrooms, setSelectedBedrooms] = useState("all");
  const [rooms, setRooms] = useState<ReturnType<typeof getRooms>>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;

  const refreshHousing = () => {
    setRooms(getRooms());
  };

  useEffect(() => {
    refreshHousing();
    setLoading(false);

    const handleUpdate = () => refreshHousing();
    window.addEventListener("campusloop_housing_updated", handleUpdate);
    return () => window.removeEventListener("campusloop_housing_updated", handleUpdate);
  }, []);

  const myInterests = useMemo(() => getUserActiveInterests(currentUser.id), [rooms, currentUser.id]);
  const myBookings = useMemo(() => getUserActiveBookings(currentUser.id), [rooms, currentUser.id]);

  // Simple plain filtering per PRD Section 3 (no scoring engine)
  const filteredRooms = rooms.filter((room) => {
    if (selectedLocation !== "all") {
      if (!room.location_label.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }
    }

    if (maxBudget) {
      const budgetNum = Number(maxBudget);
      if (budgetNum > 0 && room.rent > budgetNum) {
        return false;
      }
    }

    if (selectedBedrooms !== "all") {
      if (room.bedrooms !== Number(selectedBedrooms)) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSelectedLocation("all");
    setMaxBudget("");
    setSelectedBedrooms("all");
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Campus Housing & PGs
            </h1>
            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs">
              {filteredRooms.length} Available Listings
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Verified flats, shared hostel rooms, and PGs with transparent rent breakdown.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ModeToggle
            mode={mode}
            onModeChange={setMode}
            buyerLabel="Room Seeker"
            sellerLabel="Lister Mode"
          />

          <Button asChild size="sm" className="shadow-xs">
            <Link href="/housing/new">
              <Plus className="mr-1.5 h-4 w-4" />
              List Room
            </Link>
          </Button>
        </div>
      </div>

      {/* Active User Interest / Booking Reminder Banners */}
      {myInterests.length > 0 && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/60 p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
              <h3 className="text-xs font-bold text-amber-950 dark:text-amber-100 uppercase tracking-wider">
                Active Priority Reservation Reminders ({myInterests.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-300">
              1-Week Expiry Rule
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {myInterests.map(({ room, daysLeft, hoursLeft }) => (
              <Link
                key={room.id}
                href={`/housing/${room.id}`}
                className="rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 p-3 flex items-center justify-between hover:border-primary transition-all group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                    {room.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {room.location_label} • ₹{Math.round(room.rent / room.occupancy_total).toLocaleString("en-IN")}/mo split
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800 shrink-0">
                  <span>{daysLeft}d {hoursLeft}h left</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lister Mode Banner */}
      {mode === "seller" && (
        <div className="rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/[0.04] dark:bg-primary/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                You are in Lister Mode ({currentUser.name})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Have a vacant spot or flat? List it in 1 minute to receive inquiries in an auto-created group thread.
              </p>
            </div>
          </div>
          <Button asChild size="sm">
            <Link href="/housing/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Post Available Room
            </Link>
          </Button>
        </div>
      )}

      {/* Simple Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Location Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Location / Area
          </label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
              <SelectValue placeholder="All Campus Locations" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Main Gate">Main Gate PG</SelectItem>
              <SelectItem value="Hostel 1">Hostel 1 area</SelectItem>
              <SelectItem value="Hostel 2">Hostel 2 area</SelectItem>
              <SelectItem value="Hostel 3">Hostel 3</SelectItem>
              <SelectItem value="Hostel 5">Hostel 5</SelectItem>
              <SelectItem value="Lovely Nagar">Lovely Nagar PG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Max Budget Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Max Rent (₹)
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
            <Input
              type="number"
              placeholder="e.g. 18000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="h-9 pl-6 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Bedrooms Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            BHK / Size
          </label>
          <Select value={selectedBedrooms} onValueChange={setSelectedBedrooms}>
            <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
              <SelectValue placeholder="Any Size" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <SelectItem value="all">Any BHK</SelectItem>
              <SelectItem value="1">1 BHK / Single</SelectItem>
              <SelectItem value="2">2 BHK</SelectItem>
              <SelectItem value="3">3 BHK</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset */}
        <div className="flex items-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-9 w-full text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No housing listings found"
          description="Try broadening your location or increasing your maximum rent budget."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HousingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-7xl px-4 py-8"><LoadingSkeleton count={6} /></div>}>
      <HousingContent />
    </Suspense>
  );
}
