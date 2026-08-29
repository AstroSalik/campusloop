"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare, MessagesSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatContextHeader } from "@/components/chat/ChatContextHeader";
import { MessageThread } from "@/components/chat/MessageThread";
import { MessageInput } from "@/components/chat/MessageInput";
import { 
  getConversationById, 
  getConversations, 
  sendMessage, 
  StoredConversation 
} from "@/lib/conversations";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;

  const [conversation, setConversation] = useState<StoredConversation | null>(null);
  const [allConversations, setAllConversations] = useState<StoredConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    const conv = getConversationById(conversationId);
    setConversation(conv ? { ...conv } : null);

    const all = getConversations();
    const myConvs = all.filter((c) =>
      c.members.some((m) => m.user_id === currentUser.id)
    );
    setAllConversations(myConvs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // 1. Storage Event for instantaneous cross-tab live synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "campusloop_conversations") {
        loadData();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 2. 2-Second Polling Fallback per Project-Context.md Section 7
    const pollInterval = setInterval(loadData, 2000);

    // 3. Supabase Realtime channel (if connected)
    const supabase = createClient();
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUser.id]);

  const handleSend = async (text: string) => {
    if (!conversation) return;
    await sendMessage(conversation.id, currentUser.id, text);
    loadData();
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-0 sm:px-6 py-0 sm:py-6 h-[calc(100vh-8.5rem)] min-h-[500px]">
        <div className="h-full rounded-none sm:rounded-2xl border-0 sm:border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Conversation Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This thread may have been archived or is no longer accessible.
        </p>
        <Button asChild>
          <Link href="/messages">Back to Messages</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-0 sm:px-6 py-0 sm:py-6 h-[calc(100vh-8.5rem)] min-h-[500px]">
      <div className="h-full rounded-none sm:rounded-2xl border-0 sm:border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-none sm:shadow-xs overflow-hidden flex flex-col md:flex-row">
        {/* Left Pane: Conversation List (hidden on mobile when inside thread) */}
        <div className="hidden md:block w-80 lg:w-96 h-full shrink-0">
          <ConversationList
            conversations={allConversations}
            activeConversationId={conversationId}
            currentUserId={currentUser.id}
          />
        </div>

        {/* Right Pane: Active Chat Room */}
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
          {/* Linked Context Header (Marketplace Item / Room Card with Rent Health Link) */}
          <ChatContextHeader conversation={conversation} />

          {/* Messages Stream */}
          <MessageThread
            conversation={conversation}
            currentUserId={currentUser.id}
          />

          {/* Message Input & Quick Chips */}
          <MessageInput
            onSendMessage={handleSend}
            conversationType={conversation.type}
            isOwnerOrSeller={
              conversation.members.some(
                (m) => m.user_id === currentUser.id && (m.role === "owner" || m.role === "seller")
              ) ||
              conversation.listing?.seller_id === currentUser.id ||
              conversation.room?.owner_id === currentUser.id
            }
          />
        </div>
      </div>
    </div>
  );
}
