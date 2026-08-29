"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Building2, 
  ChevronRight, 
  Compass, 
  HandHeart, 
  HelpCircle, 
  Package, 
  Plus, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Tag, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { WantedCard } from "@/components/wanted/WantedCard";
import { WantedFilter } from "@/components/wanted/WantedFilter";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getWantedListings, StoredWantedListing } from "@/lib/wanted-data";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";

function WantedBrowseContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [wantedListings, setWantedListings] = useState<StoredWantedListing[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWantedListings(getWantedListings());
      setLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Filter listings by search query and category
  const filteredListings = wantedListings.filter((item) => {
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
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Wanted Requests
            </h1>
            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs">
              {filteredListings.length} Active Requests
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reverse marketplace — browse what students need to buy, or post your own request and let sellers reach out.
          </p>
        </div>

        {/* CTA Button */}
        <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-xs self-start sm:self-auto gap-1.5 font-semibold">
          <Link href="/wanted/new">
            <Plus className="h-4 w-4" />
            Post What You Need
          </Link>
        </Button>
      </div>

      {/* Info Callout Banner */}
      <div className="rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/[0.04] dark:bg-primary/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
            <HandHeart className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Have something a fellow student is looking for?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Click &quot;I Can Provide This&quot; on any request to open a direct instant chat with the student buyer.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 text-xs">
          <Link href="/marketplace">
            Browse Regular Marketplace
          </Link>
        </Button>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search wanted requests (e.g. mini fridge, study table, cycle, calc)..."
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

        <WantedFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Active Filters Summary */}
      {(searchQuery || selectedCategory !== "all") && (
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
          <button
            onClick={clearAllFilters}
            className="text-primary dark:text-teal-400 hover:underline ml-1 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Wanted Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : filteredListings.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No wanted requests found"
          description="We couldn't find any buyer requests matching your search or active filter."
          actionLabel="Clear Filters & Browse All"
          onAction={clearAllFilters}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((wanted) => (
            <WantedCard key={wanted.id} wanted={wanted} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WantedPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-7xl px-4 py-8"><LoadingSkeleton count={6} /></div>}>
      <WantedBrowseContent />
    </Suspense>
  );
}
