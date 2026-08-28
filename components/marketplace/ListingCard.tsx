"use client";

import Link from "next/link";
import { 
  Bike, 
  BookOpen, 
  ChevronRight, 
  Cpu, 
  Home, 
  MapPin, 
  Package, 
  Sparkles, 
  Tv, 
  Zap 
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Listing } from "@/lib/types";

interface ListingCardProps {
  listing: Listing & { seller_name?: string; seller_initials?: string; seller_email?: string };
}

export function ListingCard({ listing }: ListingCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "cycles":
        return <Bike className="h-10 w-10 text-primary/40" />;
      case "books":
        return <BookOpen className="h-10 w-10 text-primary/40" />;
      case "electronics":
        return <Cpu className="h-10 w-10 text-primary/40" />;
      case "appliances":
        return <Zap className="h-10 w-10 text-primary/40" />;
      case "furniture":
        return <Home className="h-10 w-10 text-primary/40" />;
      default:
        return <Package className="h-10 w-10 text-primary/40" />;
    }
  };

  const getConditionVariant = (cond: string) => {
    switch (cond.toLowerCase()) {
      case "brand new":
        return "bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800";
      case "like new":
        return "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "good":
        return "bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
      default:
        return "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    }
  };

  return (
    <Link href={`/marketplace/${listing.id}`} className="group block">
      <Card className="h-full overflow-hidden border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/40 dark:hover:border-primary/50 flex flex-col justify-between">
        <div>
          {/* Image / Graphic Area */}
          <div className="relative h-44 w-full bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 overflow-hidden group-hover:bg-slate-100/70 dark:group-hover:bg-slate-800 transition-colors">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0].image_url}
                alt={listing.title}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : null}
            {(!listing.images || listing.images.length === 0) && (
              <div className="flex flex-col items-center justify-center space-y-1.5 p-4 text-center">
                {getCategoryIcon(listing.category)}
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  {listing.category}
                </span>
              </div>
            )}

            {/* Type badge overlay */}
            <div className="absolute top-3 left-3">
              <Badge
                variant="default"
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 shadow-xs ${
                  listing.type === "rent"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : listing.type === "buy"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {listing.type === "rent" ? "For Rent" : listing.type === "buy" ? "Wanted" : "For Sale"}
              </Badge>
            </div>

            {/* Condition badge overlay */}
            <div className="absolute top-3 right-3">
              <span
                className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${getConditionVariant(
                  listing.condition
                )}`}
              >
                {listing.condition}
              </span>
            </div>
          </div>

          <CardHeader className="p-4 pb-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{listing.location_label}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {listing.description}
            </p>
          </CardContent>
        </div>

        <CardFooter className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/40">
          <div>
            <span className="text-xs text-slate-400 font-medium">Price</span>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">
              ₹{listing.price.toLocaleString("en-IN")}
              {listing.type === "rent" && <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/mo</span>}
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
            <span>View</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
