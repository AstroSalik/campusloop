"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Bike, 
  BookOpen, 
  Building2, 
  ExternalLink, 
  HelpCircle,
  Home, 
  Loader2,
  MapPin, 
  Package, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  Tag, 
  Trash2,
  Users 
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StoredConversation, deleteConversation } from "@/lib/conversations";
import { getClientDemoSession, getDemoUserById } from "@/lib/auth";
import { getListingById } from "@/lib/marketplace-data";
import { getRoomById } from "@/lib/housing-data";
import { getWantedListingById } from "@/lib/wanted-data";
import { calculateSplit } from "@/lib/rent-engine";

interface ChatContextHeaderProps {
  conversation: StoredConversation;
}

export function ChatContextHeader({ conversation }: ChatContextHeaderProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMarketplace = conversation.type === "marketplace_dm";
  const isWanted = conversation.type === "wanted_response";
  const isRoommate = conversation.type === "roommate_dm";
  const listing = conversation.listing_id ? getListingById(conversation.listing_id) : null;
  const room = conversation.room_id ? getRoomById(conversation.room_id) : null;
  const wanted = conversation.wanted_listing_id ? getWantedListingById(conversation.wanted_listing_id) : null;

  const currentSession = getClientDemoSession();
  const otherMembers = conversation.members.filter((m) => m.user_id !== currentSession?.id);
  const peerMember = otherMembers[0] || conversation.members[0];
  const peerAvatar = peerMember?.user_avatar || (peerMember?.user_id ? getDemoUserById(peerMember.user_id)?.avatar : null);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const user = getClientDemoSession();
      await deleteConversation(conversation.id, user?.id);
      toast.success("Thread deleted successfully");
      router.push("/messages");
    } catch (e) {
      toast.error("Failed to delete thread");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

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

          {peerAvatar ? (
            <Avatar className="h-10 w-10 shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xs">
              <img
                src={peerAvatar}
                alt={peerMember?.user_name || "User"}
                className="h-full w-full object-cover rounded-full"
              />
            </Avatar>
          ) : isRoommate ? (
            <Avatar className="h-10 w-10 shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xs">
              <AvatarFallback className="bg-primary/10 dark:bg-teal-950 text-primary dark:text-teal-300 font-bold text-xs">
                {peerMember?.user_initials || peerMember?.user_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300">
              {isWanted ? (
                <Sparkles className="h-5 w-5 text-primary dark:text-teal-400" />
              ) : isMarketplace ? (
                <Package className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>
          )}

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                {conversation.title}
              </h2>
              <Badge
                variant="outline"
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 ${
                  isWanted
                    ? "bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                    : isMarketplace
                    ? "bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                    : isRoommate
                    ? "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                    : "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                }`}
              >
                {isWanted ? "Wanted Request" : isMarketplace ? "Marketplace" : isRoommate ? "Roommate Chat" : "Housing Group"}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{conversation.subtitle}</span>
              {!isMarketplace && !isWanted && !isRoommate && (
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

        {/* Right: Quick Action Buttons */}
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

          {wanted && (
            <Button asChild variant="outline" size="sm" className="h-7 sm:h-8 text-[11px] sm:text-xs px-2.5 sm:px-3 gap-1 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Link href={`/wanted/${wanted.id}`}>
                <ExternalLink className="h-3 w-3" />
                View Wanted Request
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

          {/* Delete Thread Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            title="Delete this conversation"
            aria-label="Delete thread"
            className="h-7 sm:h-8 text-[11px] sm:text-xs px-2.5 sm:px-3 gap-1.5 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete Thread</span>
          </Button>
        </div>
      </div>

      {/* Delete Thread Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
              Delete Conversation?
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this conversation with{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                &ldquo;{conversation.title || "this chat"}&rdquo;
              </span>
              ? All messages in this thread will be permanently deleted and you will be returned to Messages.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Thread
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

