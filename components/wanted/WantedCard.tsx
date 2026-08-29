"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Bike, 
  BookOpen, 
  Clock, 
  Cpu, 
  HandHeart, 
  Home, 
  MapPin, 
  MessageSquare, 
  Package, 
  Sparkles, 
  Tag, 
  User, 
  Zap 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StoredWantedListing } from "@/lib/wanted-data";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";
import { getOrCreateWantedConversation } from "@/lib/conversations";

interface WantedCardProps {
  wanted: StoredWantedListing;
}

export function WantedCard({ wanted }: WantedCardProps) {
  const router = useRouter();
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;
  const [connecting, setConnecting] = useState(false);

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

  const handleProvideThis = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (wanted.requester_id === currentUser.id) {
      toast.info("This is your own wanted request!");
      router.push(`/wanted/${wanted.id}`);
      return;
    }

    setConnecting(true);
    try {
      const convId = await getOrCreateWantedConversation(
        wanted.id,
        currentUser.id,
        wanted.requester_id
      );
      toast.success(`Connected with ${wanted.requester_name}! Opening chat...`);
      router.push(`/messages/${convId}`);
    } catch (err) {
      toast.error("Could not open conversation. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const isOwner = wanted.requester_id === currentUser.id;

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

            <Badge 
              variant="secondary"
              className="bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 text-[11px] font-bold uppercase tracking-wider"
            >
              Wanted Request
            </Badge>
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
            Buyer Budget Ceiling:
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

          <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <Clock className="h-3 w-3" />
            <span>{new Date(wanted.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
          </div>
        </div>

        {/* Action Button */}
        {isOwner ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full text-xs h-8.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
          >
            <Link href={`/wanted/${wanted.id}`}>
              Manage Your Request
            </Link>
          </Button>
        ) : (
          <Button
            onClick={handleProvideThis}
            disabled={connecting}
            size="sm"
            className="w-full text-xs h-8.5 font-semibold bg-primary hover:bg-primary/90 text-white shadow-xs gap-1.5 transition-all active:scale-98"
          >
            <HandHeart className="h-3.5 w-3.5" />
            {connecting ? "Connecting..." : "I Can Provide This"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

