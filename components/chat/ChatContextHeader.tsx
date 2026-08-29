"use client";

import Link from "next/link";
import { 
  ArrowLeft, 
  Bike, 
  BookOpen, 
  Building2, 
  ExternalLink, 
  Home, 
  MapPin, 
  Package, 
  Percent, 
  ShieldCheck, 
  Tag, 
  Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoredConversation } from "@/lib/conversations";
import { getListingById } from "@/lib/marketplace-data";
import { getRoomById } from "@/lib/housing-data";
import { calculateSplit } from "@/lib/rent-engine";

interface ChatContextHeaderProps {
  conversation: StoredConversation;
}

export function ChatContextHeader({ conversation }: ChatContextHeaderProps) {
  const isMarketplace = conversation.type === "marketplace_dm";
  const listing = conversation.listing_id ? getListingById(conversation.listing_id) : null;
  const room = conversation.room_id ? getRoomById(conversation.room_id) : null;

  return (
    <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-3 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Linked Item Info */}
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 sm:hidden -ml-1">
            <Link href="/messages">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300">
            {isMarketplace ? (
              <Package className="h-5 w-5" />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                {conversation.title}
              </h2>
              <Badge
                variant="outline"
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 ${
                  isMarketplace
                    ? "bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                    : "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                }`}
              >
                {isMarketplace ? "Marketplace" : "Housing Group"}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{conversation.subtitle}</span>
              {!isMarketplace && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                    <Users className="h-3 w-3 text-primary dark:text-teal-400" />
                    {conversation.members.length} Members
                  </span>
                  {room && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {room.occupancy_total - (room.booked_users?.length || room.occupancy_filled)} Open Spot(s)
                      </span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons (Flow C: Deep-link to Rent Health & Itinerary) */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {room && (
            <Button asChild variant="outline" size="sm" className="h-7 sm:h-8 text-[11px] sm:text-xs px-2.5 sm:px-3 gap-1 border-primary/30 text-primary dark:text-teal-300 hover:bg-primary/5 dark:hover:bg-primary/20 bg-transparent">
              <Link href={`/rent?room=${room.id}`}>
                <Percent className="h-3 w-3" />
                Rent Health
              </Link>
            </Button>
          )}

          {listing && (
            <Button asChild variant="outline" size="sm" className="h-7 sm:h-8 text-[11px] sm:text-xs px-2.5 sm:px-3 gap-1 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Link href={`/marketplace/${listing.id}`}>
                <ExternalLink className="h-3 w-3" />
                View Listing
              </Link>
            </Button>
          )}

          {room && (
            <Button asChild size="sm" className="h-7 sm:h-8 text-[11px] sm:text-xs px-2.5 sm:px-3 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <Link href={`/housing/${room.id}`}>
                <Building2 className="h-3 w-3" />
                Spots & Itinerary
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
