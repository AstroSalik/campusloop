"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Building2, 
  ChevronRight, 
  Compass, 
  HandHeart, 
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
import { WantedCard } from "@/components/wanted/WantedCard";
import { CategoryFilter } from "@/components/marketplace/CategoryFilter";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getListings } from "@/lib/marketplace-data";
import { getWantedListings, StoredWantedListing } from "@/lib/wanted-data";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";
import { useAppMode } from "@/lib/useAppMode";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useAppMode();
  const urlQuery = searchParams.get("q") || "";
  const urlType = searchParams.get("type") || (searchParams.get("tab") === "wanted" ? "buy" : "all");

  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState(urlType);
  const [listings, setListings] = useState<ReturnType<typeof getListings>>([]);
  const [wantedListings, setWantedListings] = useState<StoredWantedListing[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;

  // Sync URL search params
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchQuery(q);
    }
    const t = searchParams.get("type");
    const tab = searchParams.get("tab");
    if (t) {
      setSelectedType(t);
    } else if (tab === "wanted") {
      setSelectedType("buy");
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setListings(getListings());
      setWantedListings(getWantedListings());
      setLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const isWantedView = selectedType === "buy";

  // Filter listings by Search Query and Category
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

  // Filter wanted requests
  const filteredWanted = wantedListings.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchName = item.requester_name.toLowerCase().includes(q);
      const matchLoc = (item.location_label || "").toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat && !matchName && !matchLoc) return false;
    }

    if (selectedCategory !== "all") {
      if (item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
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
              {isWantedView ? "Wanted Requests" : "Campus Marketplace"}
            </h1>
            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs">
              {isWantedView ? `${filteredWanted.length} Active Requests` : `${filteredListings.length} Active Items`}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isWantedView
              ? "Browse what fellow students need to buy, or post your own request and let sellers reach out."
              : "Buy, sell, or rent study essentials, cycles, and appliances across hostels & PGs."}
          </p>
        </div>

        {/* Mode Toggle & Post Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isWantedView && (
            <ModeToggle
              mode={mode}
              onModeChange={setMode}
              buyerLabel="Buyer Mode"
              sellerLabel="Seller Mode"
            />
          )}

          {isWantedView ? (
            <Button asChild size="sm" className="shadow-xs bg-primary hover:bg-primary/90 text-white font-semibold">
              <Link href="/wanted/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Post What You Need
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="shadow-xs bg-primary hover:bg-primary/90 text-white font-semibold">
              <Link href="/marketplace/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Post Listing
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Seller Mode Banner */}
      {mode === "seller" && !isWantedView && (
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
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white">
            <Link href="/marketplace/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Create New Listing
            </Link>
          </Button>
        </div>
      )}

      {/* Wanted Listings Context Callout (when in regular items view) */}
      {!isWantedView && (
        <div className="rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/[0.03] dark:bg-primary/10 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Can&apos;t find what you&apos;re looking for?
                </span>
                <Badge variant="outline" className="border-primary/30 text-primary dark:text-teal-300 text-[10px] px-1.5 py-0">
                  Wanted
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Switch to <strong>Wanted Requests</strong> to see student needs, or post a request and let sellers reach out.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedType("buy")}
              className="h-8 text-xs border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Browse Wanted ({wantedListings.length})
            </Button>
            <Button asChild size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white font-semibold gap-1">
              <Link href="/wanted/new">
                <Plus className="h-3.5 w-3.5" />
                Post Request
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder={isWantedView ? "Search wanted requests (e.g. mini fridge, study table, casio, kettle)..." : "Search cycle, study table, casio, kettle, books..."}
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
              Type: {selectedType === "sell" ? "For Sale" : selectedType === "rent" ? "For Rent" : "Wanted Requests"}
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

      {/* Grid: Wanted Listings or Marketplace Listings */}
      {loading ? (
        <LoadingSkeleton count={8} />
      ) : isWantedView ? (
        filteredWanted.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No wanted requests found"
            description="We couldn't find any buyer requests matching your search or category filter."
            actionLabel="Post What You Need"
            onAction={() => window.location.href = "/wanted/new"}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {filteredWanted.map((wanted) => (
              <WantedCard key={wanted.id} wanted={wanted} />
            ))}
          </div>
        )
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
