"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { CategoryFilter } from "@/components/marketplace/CategoryFilter";
import { WantedCard } from "@/components/wanted/WantedCard";
import { WantedFilter } from "@/components/wanted/WantedFilter";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getListings, fetchListingsFromSupabase, isListingPubliclyVisible } from "@/lib/marketplace-data";
import { getWantedListings, fetchWantedListingsFromSupabase, StoredWantedListing } from "@/lib/wanted-data";
import { getClientDemoSession } from "@/lib/auth";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const isWanted = searchParams.get("tab") === "wanted" || searchParams.get("type") === "buy";
  const urlQuery = searchParams.get("q") || "";
  const urlType = searchParams.get("type");
  const [query, setQuery] = useState(urlQuery);
  const [category, setCategory] = useState("all");
  const [type, setType] = useState(urlType === "sell" || urlType === "rent" ? urlType : "all");
  const [listings, setListings] = useState<ReturnType<typeof getListings>>([]);
  const [requests, setRequests] = useState<StoredWantedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setQuery(urlQuery);
    setCategory("all");
    setType(urlType === "sell" || urlType === "rent" ? urlType : "all");
  }, [urlQuery, urlType, isWanted]);

  useEffect(() => {
    const sync = () => setSignedIn(Boolean(getClientDemoSession()));
    sync();
    window.addEventListener("campusloop_auth_changed", sync);
    return () => window.removeEventListener("campusloop_auth_changed", sync);
  }, []);

  useEffect(() => {
    setListings(getListings());
    setRequests(getWantedListings());
    let active = true;
    const refresh = async () => {
      const [items, wanted] = await Promise.allSettled([fetchListingsFromSupabase(), fetchWantedListingsFromSupabase()]);
      if (!active) return;
      if (items.status === "fulfilled") setListings(items.value);
      if (wanted.status === "fulfilled") setRequests(wanted.value);
      setLoading(false);
    };
    void refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("campusloop_marketplace_updated", refresh);
    window.addEventListener("campusloop_wanted_updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      window.removeEventListener("campusloop_marketplace_updated", refresh);
      window.removeEventListener("campusloop_wanted_updated", refresh);
    };
  }, []);

  const keyword = query.trim();
  const needle = keyword.toLowerCase();
  const matches = (value: string, ...fields: (string | undefined)[]) =>
    (category === "all" || value.toLowerCase() === category) &&
    (!needle || fields.some((field) => field?.toLowerCase().includes(needle)));
  const visibleItems = listings.filter((item) =>
    item.type !== "buy" && isListingPubliclyVisible(item) && (type === "all" || item.type === type) &&
    matches(item.category, item.title, item.description, item.location_label, item.category)
  );
  const visibleRequests = requests.filter((request) => request.status === "active" &&
    matches(request.category, request.title, request.description, request.location_label, request.category, request.requester_name)
  );
  const count = isWanted ? visibleRequests.length : visibleItems.length;
  const filtered = Boolean(needle || category !== "all" || (!isWanted && type !== "all"));
  const requestPath = keyword ? `/wanted/new?item=${encodeURIComponent(keyword)}` : "/wanted/new";
  const signInFor = (path: string) => signedIn ? path : `/login?redirect=${encodeURIComponent(path)}`;
  const itemsHref = keyword ? `/marketplace?q=${encodeURIComponent(keyword)}` : "/marketplace";
  const wantedHref = keyword ? `/marketplace?tab=wanted&q=${encodeURIComponent(keyword)}` : "/marketplace?tab=wanted";
  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setType("all");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isWanted ? "Post what you need and your budget, or make an offer on a request." : "Browse items for sale or rent, or post a listing."}
          </p>
        </div>
        {(!isWanted || count > 0) && (
          <Button asChild size="sm" className="gap-1.5">
            <Link href={signInFor(isWanted ? requestPath : "/marketplace/new")}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              {isWanted ? "Post a request" : "Post a listing"}
            </Link>
          </Button>
        )}
      </div>

      <nav aria-label="Marketplace views" className="flex gap-6 border-b">
        {[{ title: "Browse items", href: itemsHref, current: !isWanted }, { title: "Wanted", href: wantedHref, current: isWanted }].map((view) => (
          <Link key={view.title} href={view.href} scroll={false} aria-current={view.current ? "page" : undefined}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold ${view.current ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {view.title}
          </Link>
        ))}
      </nav>

      <div className="space-y-3">
        <div className="relative max-w-xl">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input aria-label={isWanted ? "Search wanted requests" : "Search marketplace items"}
            placeholder={isWanted ? "Search wanted requests" : "Search by item or area"}
            value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 bg-card px-9" />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => setQuery("")}
              className="absolute right-2 top-1.5 grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted">
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>
        {isWanted
          ? <WantedFilter selectedCategory={category} onSelectCategory={setCategory} />
          : <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} selectedType={type} onSelectType={setType} />}
        {filtered && <button type="button" className="text-sm font-medium text-primary hover:underline" onClick={clearFilters}>Clear filters</button>}
      </div>

      {loading ? (
        <LoadingSkeleton count={6} />
      ) : count === 0 ? (
        <EmptyState icon={ShoppingBag}
          title={isWanted ? (filtered ? "No matching requests" : "No open requests yet") : (filtered ? "No items match your search" : "No items listed yet")}
          description={isWanted && filtered ? "Try another search or clear your filters." : "Post what you need and your budget so someone with the item can reach out."}
          actionLabel={isWanted && filtered ? undefined : "Post a request"}
          actionHref={isWanted && filtered ? undefined : signInFor(requestPath)}
        />
      ) : (
        <section aria-label={isWanted ? "Wanted requests" : "Marketplace items"} className="space-y-3">
          <p aria-live="polite" className="text-xs font-medium text-muted-foreground">{count} {isWanted ? (count === 1 ? "request" : "requests") : (count === 1 ? "item" : "items")}</p>
          <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${isWanted ? "" : "xl:grid-cols-4"}`}>
            {isWanted ? visibleRequests.map((wanted) => <WantedCard key={wanted.id} wanted={wanted} />) : visibleItems.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        </section>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><LoadingSkeleton count={6} /></div>}><MarketplaceContent /></Suspense>;
}
