"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Ban, 
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
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Tag, 
  Trash2,
  UserCheck, 
  UserX, 
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
import { 
  isUserBlocked, 
  isUserBlockedBy, 
  blockUser, 
  unblockUser, 
  fetchUserBlocks 
} from "@/lib/blocks";

interface ChatContextHeaderProps {
  conversation: StoredConversation;
}

export function ChatContextHeader({ conversation }: ChatContextHeaderProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteForEveryone, setDeleteForEveryone] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);

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
  const peerName = peerMember?.user_name || "this student";

  // Check and synchronize block status
  useEffect(() => {
    if (!currentSession || !peerMember?.user_id) return;

    const checkBlocks = () => {
      setIsBlocked(isUserBlocked(peerMember.user_id));
      setIsBlockedByOther(isUserBlockedBy(peerMember.user_id));
    };

    checkBlocks();
    fetchUserBlocks(currentSession.id).then(checkBlocks);

    window.addEventListener("campusloop_blocks_changed", checkBlocks);
    return () => window.removeEventListener("campusloop_blocks_changed", checkBlocks);
  }, [currentSession?.id, peerMember?.user_id]);

  const handleDelete = async (forEveryone: boolean) => {
    setIsDeleting(true);
    try {
      const user = getClientDemoSession();
      await deleteConversation(conversation.id, user?.id, { deleteForEveryone: forEveryone });
      toast.success(forEveryone ? "Chat deleted for both of you" : "Chat deleted for you");
      router.push("/messages");
    } catch (e) {
      toast.error("Failed to delete thread");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleBlock = async () => {
    if (!currentSession || !peerMember?.user_id) return;
    setIsBlocking(true);
    try {
      await blockUser(currentSession.id, peerMember.user_id);
      toast.success(`Blocked ${peerName}`);
      setBlockDialogOpen(false);
    } catch (e) {
      toast.error("Failed to block user");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblock = async () => {
    if (!currentSession || !peerMember?.user_id) return;
    setIsBlocking(true);
    try {
      await unblockUser(currentSession.id, peerMember.user_id);
      toast.success(`Unblocked ${peerName}`);
    } catch (e) {
      toast.error("Failed to unblock user");
    } finally {
      setIsBlocking(false);
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

              {isWanted ? (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                  Buyer Request
                </Badge>
              ) : isMarketplace ? (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300">
                  Marketplace
                </Badge>
              ) : isRoommate ? (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold">
                  Roommate DM
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  Housing Group
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {conversation.subtitle && (
                <span>{conversation.subtitle}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {listing && (
            <Button asChild variant="outline" size="sm" className="h-7 sm:h-8 text-[11px] sm:text-xs px-2.5 sm:px-3 gap-1 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Link href={`/marketplace/${listing.id}`}>
                <ExternalLink className="h-3 w-3" />
                View Item
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

          {/* Block / Unblock Button */}
          {peerMember && peerMember.user_id !== currentSession?.id && (
            isBlocked ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUnblock}
                disabled={isBlocking}
                title="Unblock this student"
                className="h-7 sm:h-8 text-[11px] sm:text-xs px-2.5 sm:px-3 gap-1.5 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-medium"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Unblock</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBlockDialogOpen(true)}
                disabled={isBlocking}
                title="Block this student from texting you"
                className="h-7 sm:h-8 text-[11px] sm:text-xs px-2.5 sm:px-3 gap-1.5 border-amber-300 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-medium"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Block</span>
              </Button>
            )
          )}

          {/* Telegram-style Delete Thread Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setDeleteForEveryone(false);
              setDeleteDialogOpen(true);
            }}
            title="Delete this conversation"
            aria-label="Delete thread"
            className="h-7 sm:h-8 text-[11px] sm:text-xs px-2.5 sm:px-3 gap-1.5 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete Chat</span>
          </Button>
        </div>
      </div>

      {/* Block Status Banners */}
      {isBlocked && (
        <div className="mt-2.5 flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
          <span className="flex items-center gap-1.5">
            <Ban className="h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
            <span>You have blocked <strong>{peerName}</strong>. They cannot send you messages.</span>
          </span>
          <button
            type="button"
            onClick={handleUnblock}
            className="underline font-semibold hover:text-red-900 dark:hover:text-red-100"
          >
            Unblock
          </button>
        </div>
      )}

      {isBlockedByOther && !isBlocked && (
        <div className="mt-2.5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs">
          <Ban className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>You cannot send messages to this student because they have blocked you.</span>
        </div>
      )}

      {/* Telegram-style Delete Chat Confirmation Dialog */}
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
              Delete Chat
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this chat with{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                &ldquo;{peerName}&rdquo;
              </span>?
            </DialogDescription>
          </DialogHeader>

          {/* Telegram Checkbox: Also delete for peer */}
          <div className="my-2">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={deleteForEveryone}
                onChange={(e) => setDeleteForEveryone(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
              />
              <div className="text-left space-y-0.5">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  Also delete for {peerName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  {deleteForEveryone
                    ? "Permanently erase this chat and all messages for both of you."
                    : "Delete from your inbox only. The other student will keep their full chat history."}
                </p>
              </div>
            </label>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleDelete(deleteForEveryone)}
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
                  {deleteForEveryone ? "Delete for Both of Us" : "Delete for Me"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Student Confirmation Dialog */}
      <Dialog
        open={blockDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isBlocking) setBlockDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Ban className="h-5 w-5" />
              Block {peerName}?
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm text-slate-600 dark:text-slate-300 space-y-2">
              <span>
                Blocked students will not be able to message you or reply to your listings. You can unblock them at any time.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBlockDialogOpen(false)}
              disabled={isBlocking}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleBlock}
              disabled={isBlocking}
              className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isBlocking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Blocking...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  Block Student
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
