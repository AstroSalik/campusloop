"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  ChevronRight, 
  Compass, 
  FileText, 
  Home, 
  Percent, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Tag, 
  Users, 
  Users2, 
  X 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getListings } from "@/lib/marketplace-data";
import { getRooms, getRoommateProfiles } from "@/lib/housing-data";

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "marketplace" | "housing" | "roommates">("all");

  const listings = useMemo(() => getListings(), []);
  const rooms = useMemo(() => getRooms(), []);
  const roommateProfiles = useMemo(() => getRoommateProfiles(), []);

  // Filter listings
  const filteredListings = useMemo(() => {
    if (!query.trim()) return listings.slice(0, 4);
    const q = query.toLowerCase();
    return listings.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location_label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [query, listings]);

  // Filter rooms
  const filteredRooms = useMemo(() => {
    if (!query.trim()) return rooms.slice(0, 3);
    const q = query.toLowerCase();
    return rooms.filter(
      (room) =>
        room.title.toLowerCase().includes(q) ||
        room.location_label.toLowerCase().includes(q) ||
        room.amenities.some((a) => a.toLowerCase().includes(q))
    );
  }, [query, rooms]);

  // Filter roommates
  const filteredRoommates = useMemo(() => {
    if (!query.trim()) return roommateProfiles.slice(0, 3);
    const q = query.toLowerCase();
    return roommateProfiles.filter(
      (p) =>
        p.user_name.toLowerCase().includes(q) ||
        p.preferred_location.toLowerCase().includes(q) ||
        p.lifestyle_tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query, roommateProfiles]);

  const totalResults =
    (activeCategory === "all" || activeCategory === "marketplace" ? filteredListings.length : 0) +
    (activeCategory === "all" || activeCategory === "housing" ? filteredRooms.length : 0) +
    (activeCategory === "all" || activeCategory === "roommates" ? filteredRoommates.length : 0);

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(path);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onOpenChange(false);
      router.push(`/marketplace?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 sm:rounded-2xl top-[20%] translate-y-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search CampusLoop</DialogTitle>
        </DialogHeader>

        {/* Top Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-slate-200/80 dark:border-slate-800 px-4 py-3.5 bg-slate-50/80 dark:bg-slate-800/80">
          <Search className="h-5 w-5 text-primary dark:text-teal-400 shrink-0 mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, books, cycles, flats, roommates..."
            className="border-0 bg-transparent p-0 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-9 text-slate-900 dark:text-white"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs overflow-x-auto">
          <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">Filter:</span>
          {(
            [
              { id: "all", label: "All Results" },
              { id: "marketplace", label: `Marketplace (${filteredListings.length})` },
              { id: "housing", label: `Housing (${filteredRooms.length})` },
              { id: "roommates", label: `Roommates (${filteredRoommates.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                activeCategory === tab.id
                  ? "bg-primary text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 divide-y divide-slate-100 dark:divide-slate-800">
          {totalResults === 0 && (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Try searching for &quot;cycle&quot;, &quot;table&quot;, &quot;calculator&quot;, or &quot;Main Gate&quot;.</p>
            </div>
          )}

          {/* 1. Marketplace Results */}
          {(activeCategory === "all" || activeCategory === "marketplace") && filteredListings.length > 0 && (
            <div className="space-y-2 pt-2 first:pt-0">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Marketplace Items
                </span>
                {query.trim() && (
                  <button
                    onClick={() => handleNavigate(`/marketplace?q=${encodeURIComponent(query)}`)}
                    className="text-primary dark:text-teal-400 hover:underline lowercase font-normal"
                  >
                    view all ({filteredListings.length}) →
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {filteredListings.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNavigate(`/marketplace/${item.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 font-bold text-xs">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-teal-300 transition-colors truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-400 truncate">
                          {item.category} • {item.location_label} • <span className="font-medium text-slate-600 dark:text-slate-300">{item.condition}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Housing Results */}
          {(activeCategory === "all" || activeCategory === "housing") && filteredRooms.length > 0 && (
            <div className="space-y-2 pt-4 first:pt-0">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                  <Building2 className="h-3.5 w-3.5" />
                  Accommodations & Flats
                </span>
                {query.trim() && (
                  <button
                    onClick={() => handleNavigate(`/housing`)}
                    className="text-primary dark:text-teal-400 hover:underline lowercase font-normal"
                  >
                    view all ({filteredRooms.length}) →
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {filteredRooms.slice(0, 3).map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleNavigate(`/housing/${room.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-teal-300 transition-colors truncate">
                          {room.title}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-400 truncate">
                          {room.bedrooms} BHK • {room.location_label} • Available {room.available_from}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        ₹{room.rent.toLocaleString("en-IN")}/mo
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Roommate Results */}
          {(activeCategory === "all" || activeCategory === "roommates") && filteredRoommates.length > 0 && (
            <div className="space-y-2 pt-4 first:pt-0">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                  <Users2 className="h-3.5 w-3.5" />
                  Roommate Profiles
                </span>
                <button
                  onClick={() => handleNavigate(`/roommates`)}
                  className="text-primary dark:text-teal-400 hover:underline lowercase font-normal"
                >
                  view all ({filteredRoommates.length}) →
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {filteredRoommates.slice(0, 3).map((prof) => (
                  <div
                    key={prof.id}
                    onClick={() => handleNavigate(`/roommates`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-bold text-xs">
                        <Users2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-teal-300 transition-colors truncate">
                          {prof.user_name}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-400 truncate">
                          Prefers {prof.preferred_location} • Move-in: {prof.move_in_month}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
                        ₹{prof.budget_min.toLocaleString("en-IN")} - ₹{prof.budget_max.toLocaleString("en-IN")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Page Jump Shortcuts */}
          <div className="pt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-400 dark:text-slate-500 mr-1">Quick Links:</span>
            <button
              onClick={() => handleNavigate("/rent")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Percent className="h-3 w-3 text-primary dark:text-teal-400" />
              Rent Health Calculator
            </button>
            <button
              onClick={() => handleNavigate("/marketplace/new")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ShoppingBag className="h-3 w-3 text-teal-600 dark:text-teal-400" />
              + List an Item
            </button>
            <button
              onClick={() => handleNavigate("/housing/new")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Building2 className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
              + Post a Flat
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300 shadow-2xs">ESC</kbd> to close</span>
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300 shadow-2xs">Enter ↵</kbd> to search marketplace</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
