"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  CheckCheck, 
  Loader2,
  MessageSquare, 
  Package, 
  Search, 
  Tag, 
  Trash2,
  Users 
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  StoredConversation, 
  deleteConversation,
  getConversationUnreadCount, 
  getTotalUnreadCount, 
  markConversationAsRead 
} from "@/lib/conversations";

interface ConversationListProps {
  conversations: StoredConversation[];
  activeConversationId?: string;
  currentUserId: string;
}

export function ConversationList({
  conversations,
  activeConversationId,
  currentUserId,
}: ConversationListProps) {
  const router = useRouter();
  const [filterType, setFilterType] = useState<"all" | "marketplace_dm" | "housing_group" | "wanted_response">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversationToDelete, setConversationToDelete] = useState<StoredConversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete) return;
    setIsDeleting(true);
    try {
      await deleteConversation(conversationToDelete.id, currentUserId);
      toast.success("Thread deleted successfully");
      if (activeConversationId === conversationToDelete.id) {
        router.push("/messages");
      }
    } catch (e) {
      toast.error("Failed to delete thread");
    } finally {
      setIsDeleting(false);
      setConversationToDelete(null);
    }
  };

  const sorted = [...conversations].sort((a, b) => {
    const timeA = a.messages && a.messages.length > 0 
      ? new Date(a.messages[a.messages.length - 1].created_at).getTime()
      : new Date(a.created_at).getTime();
    const timeB = b.messages && b.messages.length > 0 
      ? new Date(b.messages[b.messages.length - 1].created_at).getTime()
      : new Date(b.created_at).getTime();
    return timeB - timeA;
  });

  const filtered = sorted.filter((c) => {
    if (filterType !== "all" && c.type !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchSub = c.subtitle?.toLowerCase().includes(q);
      const matchMember = c.members.some((m) => m.user_name.toLowerCase().includes(q));
      if (!matchTitle && !matchSub && !matchMember) return false;
    }
    return true;
  });

  const totalUnread = getTotalUnreadCount(conversations, currentUserId);

  return (
    <div className="flex h-full flex-col border-r-0 md:border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
      {/* Header & Tabs */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary dark:text-teal-400" />
              Messages
            </h2>
            {totalUnread > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 text-white font-extrabold text-[10px] px-1.5 shadow-xs animate-pulse">
                {totalUnread} new
              </span>
            )}
          </div>
          <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
            {conversations.length} Threads
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-[11px]">
          <button
            onClick={() => setFilterType("all")}
            className={`py-1 rounded-md font-semibold transition-all flex items-center justify-center gap-1 ${
              filterType === "all"
                ? "bg-white dark:bg-slate-900 text-primary dark:text-teal-300 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>All</span>
            {totalUnread > 0 && (
              <span className="h-4 min-w-[14px] px-1 rounded-full bg-emerald-500 text-[9px] font-extrabold text-white flex items-center justify-center">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterType("marketplace_dm")}
            className={`py-1 rounded-md font-semibold transition-all ${
              filterType === "marketplace_dm"
                ? "bg-white dark:bg-slate-900 text-primary dark:text-teal-300 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setFilterType("housing_group")}
            className={`py-1 rounded-md font-semibold transition-all ${
              filterType === "housing_group"
                ? "bg-white dark:bg-slate-900 text-primary dark:text-teal-300 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Housing
          </button>
          <button
            onClick={() => setFilterType("wanted_response")}
            className={`py-1 rounded-md font-semibold transition-all ${
              filterType === "wanted_response"
                ? "bg-white dark:bg-slate-900 text-primary dark:text-teal-300 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Wanted
          </button>
        </div>
      </div>

      {/* Conversation Thread Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
            <MessageSquare className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p>No conversations found.</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const lastMsg = conv.messages[conv.messages.length - 1];
            const otherMembers = conv.members.filter((m) => m.user_id !== currentUserId);
            const isGroup = conv.type === "housing_group";
            const isWanted = conv.type === "wanted_response";
            const unreadCount = getConversationUnreadCount(conv, currentUserId);
            const hasUnread = unreadCount > 0;

            const displayTitle = conv.title || (isGroup ? "Housing Group" : otherMembers[0]?.user_name || "Chat");
            const timeStr = lastMsg
              ? new Date(lastMsg.created_at).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={conv.id}
                className={`group relative flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                  isActive
                    ? "bg-primary/5 dark:bg-primary/15 border-l-4 border-primary pl-2.5"
                    : hasUnread
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-l-4 border-emerald-500 pl-2.5"
                    : ""
                }`}
              >
                <Link
                  href={`/messages/${conv.id}`}
                  onClick={() => markConversationAsRead(conv.id, currentUserId)}
                  className="flex flex-1 items-start gap-3 p-3.5 min-w-0"
                >
                  {/* Avatar / Stack with Unread Dot */}
                  <div className="relative shrink-0">
                    {hasUnread && (
                      <span className="absolute -top-1 -left-1 z-10 flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                    )}
                    {isGroup ? (
                      <div className="flex -space-x-2 overflow-hidden">
                        {conv.members.slice(0, 2).map((m, i) => (
                          <Avatar key={i} className="h-9 w-9 border-2 border-white dark:border-slate-800 shadow-2xs">
                            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                              {m.user_initials || m.user_name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    ) : isWanted ? (
                      <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                        <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300 font-bold text-xs">
                          {otherMembers[0]?.user_initials || otherMembers[0]?.user_name?.[0] || "W"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                        <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300 font-bold text-xs">
                          {otherMembers[0]?.user_initials || otherMembers[0]?.user_name?.[0] || "S"}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {isGroup && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white shadow-2xs">
                        {conv.members.length}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {hasUnread && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                        <h3
                          className={`text-xs truncate ${
                            isActive
                              ? "text-primary dark:text-teal-300 font-bold"
                              : hasUnread
                              ? "font-black text-slate-950 dark:text-white"
                              : "font-semibold text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {displayTitle}
                        </h3>
                      </div>
                      <span
                        className={`text-[10px] shrink-0 font-semibold ${
                          hasUnread
                            ? "text-emerald-600 dark:text-teal-400 font-bold"
                            : "text-slate-400 dark:text-slate-500 font-medium"
                        }`}
                      >
                        {timeStr}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs truncate leading-tight flex-1 ${
                          hasUnread
                            ? "font-bold text-slate-950 dark:text-slate-100"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {lastMsg ? lastMsg.content : "No messages yet"}
                      </p>

                      {/* WhatsApp-style green pill badge */}
                      {hasUnread && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white shadow-xs px-1.5 shrink-0 animate-in zoom-in-50">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Badge
                        variant="secondary"
                        className={`text-[9px] px-1.5 py-0 font-medium ${
                          isWanted
                            ? "bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50"
                            : isGroup
                            ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
                            : "bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50"
                        }`}
                      >
                        {isWanted ? "Wanted Request" : isGroup ? "Housing Group" : "Marketplace DM"}
                      </Badge>
                    </div>
                  </div>
                </Link>

                {/* Delete Thread Button */}
                <div className="pr-3 pl-1 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    title="Delete thread"
                    aria-label={`Delete conversation with ${displayTitle}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConversationToDelete(conv);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Thread Confirmation Dialog */}
      <Dialog
        open={!!conversationToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setConversationToDelete(null);
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
                &ldquo;{conversationToDelete?.title || "this chat"}&rdquo;
              </span>
              ? All messages in this thread will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConversationToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
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
