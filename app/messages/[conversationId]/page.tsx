"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatContextHeader } from "@/components/chat/ChatContextHeader";
import { MessageThread } from "@/components/chat/MessageThread";
import { MessageInput } from "@/components/chat/MessageInput";
import { 
  fetchConversationByIdFromSupabase,
  fetchUserConversationsFromSupabase,
  getConversationById, 
  getConversations, 
  sendMessage, 
  markConversationAsRead,
  StoredConversation 
} from "@/lib/conversations";
import { getClientDemoSession, DemoUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { AuthRequiredGuard } from "@/components/auth/AuthRequiredGuard";
import { 
  isUserBlocked, 
  isUserBlockedBy, 
  unblockUser, 
  fetchUserBlocks 
} from "@/lib/blocks";

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(() => getClientDemoSession());

  const [conversation, setConversation] = useState<StoredConversation | null>(null);
  const [allConversations, setAllConversations] = useState<StoredConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);

  // Identify the peer participant in DM conversations
  const otherMembers = conversation?.members.filter((m) => m.user_id !== currentUser?.id) || [];
  const peerMember = otherMembers[0] || conversation?.members[0];
  const peerName = peerMember?.user_name || "this student";

  // Check and refresh block statuses
  useEffect(() => {
    if (!currentUser || !peerMember?.user_id) return;

    const checkBlocks = () => {
      setIsBlocked(isUserBlocked(peerMember.user_id));
      setIsBlockedByOther(isUserBlockedBy(peerMember.user_id));
    };

    checkBlocks();
    fetchUserBlocks(currentUser.id).then(checkBlocks);

    window.addEventListener("campusloop_blocks_changed", checkBlocks);
    return () => window.removeEventListener("campusloop_blocks_changed", checkBlocks);
  }, [currentUser?.id, peerMember?.user_id]);

  const handleUnblockPeer = async () => {
    if (!currentUser || !peerMember?.user_id) return;
    try {
      await unblockUser(currentUser.id, peerMember.user_id);
      toast.success(`Unblocked ${peerName}`);
      setIsBlocked(false);
    } catch {
      toast.error("Failed to unblock student");
    }
  };

  const syncLocal = () => {
    if (!currentUser) return;
    markConversationAsRead(conversationId, currentUser.id);
    const conv = getConversationById(conversationId);
    if (conv) {
      setConversation({ ...conv });
    }
    const all = getConversations();
    const myConvs = all.filter((c) =>
      c.members.some((m) => m.user_id === currentUser.id)
    );
    setAllConversations(myConvs);
  };

  const syncCloud = async () => {
    if (!currentUser) return;
    try {
      markConversationAsRead(conversationId, currentUser.id);
      // 1. Fetch current conversation details & messages from Supabase
      const cloudConv = await fetchConversationByIdFromSupabase(conversationId);
      if (cloudConv) {
        setConversation({ ...cloudConv });
      }

      // 2. Fetch all user conversations for sidebar
      const cloudUserConvs = await fetchUserConversationsFromSupabase(currentUser.id);
      setAllConversations(cloudUserConvs);
    } catch (e) {
      syncLocal();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncLocal();
    syncCloud();

    // Storage & custom event listeners
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "campusloop_conversations") {
        syncLocal();
      }
    };
    const handleCustomUpdate = () => {
      syncLocal();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("campusloop_conversations_updated", handleCustomUpdate);

    // Periodic cloud poll (every 2.5s for snappy multi-device sync)
    const pollInterval = setInterval(() => {
      syncCloud();
    }, 2500);

    // Supabase Realtime channel for instant push on new message
    const supabase = createClient();
    const channel = supabase
      .channel(`chat-room-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          syncCloud();
        }
      )
      .subscribe();

    const handleAuth = () => {
      setCurrentUser(getClientDemoSession());
    };
    window.addEventListener("campusloop_auth_changed", handleAuth);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("campusloop_conversations_updated", handleCustomUpdate);
      window.removeEventListener("campusloop_auth_changed", handleAuth);
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUser]);

  const handleSend = async (text: string) => {
    if (!conversation || !currentUser) return;
    await sendMessage(conversation.id, currentUser.id, text);
    syncLocal();
  };

  if (!currentUser) {
    return (
      <AuthRequiredGuard
        title="Student Sign In Required"
        featureName="Conversation Details"
        description="To access this private student message thread, negotiate terms, or send messages, please sign in with your student account."
        redirectUrl={`/messages/${conversationId}`}
        backUrl="/messages"
        backLabel="Back to Messages"
      />
    );
  }

  if (loading && !conversation) {
    return (
      <div className="container mx-auto max-w-7xl px-0 sm:px-6 py-0 sm:py-6 h-[calc(100dvh-4rem)] md:h-[calc(100dvh-5.5rem)] min-h-[460px] -mb-16 lg:mb-0">
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
    <div className="container mx-auto max-w-7xl px-0 sm:px-6 py-0 sm:py-6 h-[calc(100dvh-4rem)] md:h-[calc(100dvh-5.5rem)] min-h-[460px] -mb-16 lg:mb-0">
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
            isBlocked={isBlocked}
            isBlockedByOther={isBlockedByOther}
            peerName={peerName}
            onUnblock={handleUnblockPeer}
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
