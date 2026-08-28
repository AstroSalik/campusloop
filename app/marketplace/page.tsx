"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Building2, 
  ChevronRight, 
  Compass, 
  Package, 
  Plus, 
  Search, 
  ShoppingBag, 
  SlidersHorizontal, 
  Sparkles, 
  Store, 
  Tag, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { CategoryFilter } from "@/components/marketplace/CategoryFilter";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getListings } from "@/lib/marketplace-data";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";
import { useAppMode } from "@/lib/useAppMode";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useAppMode();
  const urlQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [listings, setListings] = useState<ReturnType<typeof getListings>>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;

  // Sync URL search params
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setListings(getListings());
      setLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Filter listings by Search Query, Category, and Type
  const filteredListings = listings.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.location_label.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }

    if (selectedCategory !== "all") {
      if (item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    if (selectedType !== "all") {
      if (item.type.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Header & Buyer / Seller Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Campus Marketplace
            </h1>
            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs">
              {filteredListings.length} Active Items
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Buy, sell, or rent study essentials, cycles, and appliances across hostels & PGs.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ModeToggle
            mode={mode}
            onModeChange={setMode}
            buyerLabel="Buyer Mode"
            sellerLabel="Seller Mode"
          />

          <Button asChild size="sm" className="shadow-xs">
            <Link href="/marketplace/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Post Listing
            </Link>
          </Button>
        </div>
      </div>

      {/* Seller Mode Banner */}
      {mode === "seller" && (
        <div className="rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/[0.04] dark:bg-primary/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                You are in Seller Mode ({currentUser.name})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Moving out or upgrading? Post an item in 30 seconds to reach thousands of campus students.
              </p>
            </div>
          </div>
          <Button asChild size="sm">
            <Link href="/marketplace/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Create New Listing
            </Link>
          </Button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search cycle, study table, casio, kettle, books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white dark:bg-slate-800/90 shadow-xs border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedType={selectedType}
          onSelectType={setSelectedType}
        />
      </div>

      {/* Active Filters Summary */}
      {(searchQuery || selectedCategory !== "all" || selectedType !== "all") && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
              Keyword: &quot;{searchQuery}&quot;
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
            </Badge>
          )}
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 capitalize">
              {selectedCategory}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
            </Badge>
          )}
          {selectedType !== "all" && (
            <Badge variant="secondary" className="gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 capitalize">
              Type: {selectedType === "sell" ? "For Sale" : selectedType === "rent" ? "For Rent" : "Wanted"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedType("all")} />
            </Badge>
          )}
          <button
            onClick={clearAllFilters}
            className="text-primary dark:text-teal-400 hover:underline ml-1 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Listings Grid */}
      {loading ? (
        <LoadingSkeleton count={8} />
      ) : filteredListings.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No marketplace listings found"
          description="We couldn't find any items matching your active search or filters."
          actionLabel="Clear Filters & Browse All"
          onAction={clearAllFilters}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-7xl px-4 py-8"><LoadingSkeleton count={8} /></div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
