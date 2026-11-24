"use client";

import Link from "next/link";
import { 
  Bike, 
  BookOpen, 
  Clock, 
  Cpu, 
  HandHeart, 
  Home, 
  MapPin, 
  Package, 
  Zap 
} from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StoredWantedListing } from "@/lib/wanted-data";
import { getClientDemoSession } from "@/lib/auth";

interface WantedCardProps {
  wanted: StoredWantedListing;
}

export function WantedCard({ wanted }: WantedCardProps) {
  const currentUser = getClientDemoSession();

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "cycles":
        return <Bike className="h-3.5 w-3.5 text-primary dark:text-teal-400" />;
      case "books":
        return <BookOpen className="h-3.5 w-3.5 text-primary dark:text-teal-400" />;
      case "electronics":
        return <Cpu className="h-3.5 w-3.5 text-primary dark:text-teal-400" />;
      case "appliances":
        return <Zap className="h-3.5 w-3.5 text-primary dark:text-teal-400" />;
      case "furniture":
        return <Home className="h-3.5 w-3.5 text-primary dark:text-teal-400" />;
      default:
        return <Package className="h-3.5 w-3.5 text-primary dark:text-teal-400" />;
    }
  };

  const isOwner = currentUser ? wanted.requester_id === currentUser.id : false;
  const createdAt = new Date(wanted.created_at);

  return (
    <Card className="group overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:border-primary/40 dark:hover:border-teal-700/60 hover:shadow-md flex flex-col justify-between rounded-xl">
      <Link href={`/wanted/${wanted.id}`} className="block flex-1">
        {/* Header Badges */}
        <div className="p-4 pb-2 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <Badge 
              variant="outline" 
              className="gap-1.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold py-0.5"
            >
              {getCategoryIcon(wanted.category)}
              <span>{wanted.category}</span>
            </Badge>

            {wanted.location_label && (
              <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{wanted.location_label}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary dark:group-hover:text-teal-300 transition-colors leading-snug">
            {wanted.title}
          </h3>

          {/* Description Preview */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {wanted.description}
          </p>
        </div>

        {/* Budget Ceiling Display */}
        <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-y border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Maximum budget
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white">
            Up to ₹{wanted.budget_max.toLocaleString("en-IN")}
          </span>
        </div>
      </Link>

      {/* Footer: Requester & CTA */}
      <CardFooter className="p-4 pt-3 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border border-slate-200 dark:border-slate-700">
              <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300 text-[10px] font-bold">
                {wanted.requester_initials || wanted.requester_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
              {wanted.requester_name}
            </span>
          </div>

          {Number.isFinite(createdAt.getTime()) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock aria-hidden="true" className="h-3 w-3" />
              <time dateTime={createdAt.toISOString()}>{createdAt.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</time>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button asChild variant="outline" className="h-10 w-full gap-1.5">
          <Link href={`/wanted/${wanted.id}${isOwner ? "" : "?offer=1"}`}>
            {!isOwner && <HandHeart aria-hidden="true" className="h-3.5 w-3.5" />}
            {isOwner ? "Manage request" : "Make an offer"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

