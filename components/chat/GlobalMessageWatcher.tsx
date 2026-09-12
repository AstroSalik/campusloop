"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  fetchUserConversationsFromSupabase, 
  getConversations, 
  markConversationAsRead, 
  saveConversations,
  StoredConversation
} from "@/lib/conversations";
import { getClientDemoSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { notifyIncomingMessage } from "@/lib/notifications";

export function GlobalMessageWatcher() {
  const pathname = usePathname();
  const router = useRouter();
  const knownMessageIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Mark active conversation as read whenever pathname changes
  useEffect(() => {
    const user = getClientDemoSession();
    if (!user) return;
    if (pathname.startsWith("/messages/") && pathname !== "/messages") {
      const activeConvId = pathname.replace("/messages/", "").split("/")[0];
      if (activeConvId) {
        markConversationAsRead(activeConvId, user.id);
      }
    }
  }, [pathname]);

  // Long-lived Supabase Realtime Listener + Heartbeat Sync
  useEffect(() => {
    const user = getClientDemoSession();
    if (!user) return;

    // 1. Prime known message IDs with current local cache
    const initialConvs = getConversations();
    initialConvs.forEach((c) => {
      c.messages?.forEach((m) => {
        knownMessageIdsRef.current.add(m.id);
      });
    });

    // 2. Synchronization & Detection Routine
    const checkAndSyncMessages = async () => {
      const activeUser = getClientDemoSession();
      if (!activeUser) return;

      try {
        const cloudConvs: StoredConversation[] = await fetchUserConversationsFromSupabase(activeUser.id);
        const currentPath = pathnameRef.current;
        const currentActiveConvId =
          currentPath.startsWith("/messages/") && currentPath !== "/messages"
            ? currentPath.replace("/messages/", "").split("/")[0]
            : null;

        // If this is the very first sync, just index existing messages without sounding alerts
        if (!initializedRef.current) {
          cloudConvs.forEach((c) => {
            c.messages?.forEach((m) => {
              knownMessageIdsRef.current.add(m.id);
            });
          });
          initializedRef.current = true;
          return;
        }

        // Check for new incoming messages
        for (const conv of cloudConvs) {
          for (const msg of conv.messages || []) {
            if (!knownMessageIdsRef.current.has(msg.id)) {
              knownMessageIdsRef.current.add(msg.id);

              // If message was sent by someone else
              if (msg.sender_id !== activeUser.id) {
                // Check if user is currently looking at this conversation
                const isLookingAtThisConv =
                  currentActiveConvId === conv.id &&
                  typeof document !== "undefined" &&
                  document.visibilityState === "visible";

                if (isLookingAtThisConv) {
                  markConversationAsRead(conv.id, activeUser.id);
                } else {
                  const senderMember = conv.members.find((m) => m.user_id === msg.sender_id);
                  const senderName = senderMember?.user_name || "Campus Student";

                  notifyIncomingMessage({
                    message: msg,
                    senderName,
                    senderInitials: senderMember?.user_initials,
                    conversationTitle: conv.title,
                    conversationId: conv.id,
                    onOpen: () => {
                      router.push(`/messages/${conv.id}`);
                    },
                  });
                }
              }
            }
          }
        }
      } catch (e) {
        // network exception handled gracefully
      }
    };

    // Initial background sync with small delay to not compete with page hydration
    const timeout = setTimeout(checkAndSyncMessages, 1000);

    // 3. Setup Supabase Realtime Postgres Changes Listener
    const supabase = createClient();
    const channel = supabase
      .channel("global-messages-watcher")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          checkAndSyncMessages();
        }
      )
      .subscribe();

    // 4. Lightweight fallback heartbeat every 20 seconds (Realtime handles instant delivery)
    const interval = setInterval(checkAndSyncMessages, 20000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
