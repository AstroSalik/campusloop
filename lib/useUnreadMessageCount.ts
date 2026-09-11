"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  getConversations, 
  getTotalUnreadCount, 
  markConversationAsRead,
  StoredConversation 
} from "@/lib/conversations";
import { getClientDemoSession } from "@/lib/auth";

export function useUnreadMessageCount() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const calculateCount = useCallback(() => {
    const user = getClientDemoSession();
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const convs: StoredConversation[] = getConversations();
    const count = getTotalUnreadCount(convs, user.id);
    setUnreadCount(count);
  }, []);

  useEffect(() => {
    calculateCount();

    const handleUpdate = () => calculateCount();

    window.addEventListener("campusloop_conversations_updated", handleUpdate);
    window.addEventListener("campusloop_read_receipts_updated", handleUpdate);
    window.addEventListener("campusloop_auth_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("campusloop_conversations_updated", handleUpdate);
      window.removeEventListener("campusloop_read_receipts_updated", handleUpdate);
      window.removeEventListener("campusloop_auth_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [calculateCount]);

  const markAsRead = useCallback((conversationId: string) => {
    const user = getClientDemoSession();
    if (user) {
      markConversationAsRead(conversationId, user.id);
      calculateCount();
    }
  }, [calculateCount]);

  return { unreadCount, markAsRead, refreshUnread: calculateCount };
}
