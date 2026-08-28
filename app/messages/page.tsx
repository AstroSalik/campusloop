"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, MessagesSquare, ShieldCheck, Sparkles, Store } from "lucide-react";
import { ConversationList } from "@/components/chat/ConversationList";
import { getConversations, StoredConversation } from "@/lib/conversations";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserConversations = () => {
    const all = getConversations();
    const myConvs = all.filter((c) =>
      c.members.some((m) => m.user_id === currentUser.id)
    );
    setConversations(myConvs);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserConversations();

    // 1. Storage event listener for instant cross-tab live synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "campusloop_conversations") {
        fetchUserConversations();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 2. Fallback polling per Project-Context.md Section 7
    const interval = setInterval(fetchUserConversations, 2500);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [currentUser.id]);

  return (
    <div className="container mx-auto max-w-7xl px-0 sm:px-6 py-0 sm:py-6 h-[calc(100vh-8.5rem)] min-h-[500px]">
      <div className="h-full rounded-none sm:rounded-2xl border-0 sm:border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-none sm:shadow-xs overflow-hidden flex flex-col md:flex-row">
        {/* Left Pane: Conversation List */}
        <div className="w-full md:w-80 lg:w-96 h-full shrink-0">
          <ConversationList
            conversations={conversations}
            currentUserId={currentUser.id}
          />
        </div>

        {/* Right Pane: Placeholder when no thread is selected */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 bg-slate-50/40 dark:bg-slate-900/40 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-teal-400">
            <MessagesSquare className="h-8 w-8" />
          </div>
          <div className="max-w-sm space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Select a conversation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose a marketplace listing inquiry or housing roommate group from the sidebar to start chatting.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/housing">Explore Housing</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
