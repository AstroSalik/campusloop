"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { ConversationList } from "@/components/chat/ConversationList";
import { 
  fetchUserConversationsFromSupabase, 
  getConversations, 
  StoredConversation 
} from "@/lib/conversations";
import { getClientDemoSession, DemoUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { AuthRequiredGuard } from "@/components/auth/AuthRequiredGuard";

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(() => getClientDemoSession());
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuth = () => {
      setCurrentUser(getClientDemoSession());
    };
    window.addEventListener("campusloop_auth_changed", handleAuth);
    return () => window.removeEventListener("campusloop_auth_changed", handleAuth);
  }, []);

  const syncLocalConversations = () => {
    if (!currentUser) return;
    const all = getConversations();
    const myConvs = all.filter((c) =>
      c.members.some((m) => m.user_id === currentUser.id)
    );
    setConversations(myConvs);
    setLoading(false);
  };

  const syncCloudConversations = async () => {
    if (!currentUser) return;
    try {
      const cloudConvs = await fetchUserConversationsFromSupabase(currentUser.id);
      setConversations(cloudConvs);
    } catch (e) {
      syncLocalConversations();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial load from local cache + Supabase cloud
    syncLocalConversations();
    syncCloudConversations();

    // 2. Storage & internal event listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "campusloop_conversations") {
        syncLocalConversations();
      }
    };
    const handleCustomUpdate = () => {
      syncLocalConversations();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("campusloop_conversations_updated", handleCustomUpdate);

    // 3. Fallback periodic sync with cloud
    const interval = setInterval(() => {
      syncCloudConversations();
    }, 3000);

    // 4. Supabase Realtime listener
    const supabase = createClient();
    const channel = supabase
      .channel("messages-live-page")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          syncCloudConversations();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("campusloop_conversations_updated", handleCustomUpdate);
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <AuthRequiredGuard
        title="Student Sign In Required"
        featureName="Campus Messages & Chat"
        description="To access your direct student conversations, negotiate marketplace items, and chat with prospective roommates or hosts, please sign in."
        redirectUrl="/messages"
        backUrl="/"
        backLabel="Back to Home"
      />
    );
  }

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
              Choose a marketplace listing inquiry, housing roommate group, or wanted item response from the sidebar to start chatting.
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
