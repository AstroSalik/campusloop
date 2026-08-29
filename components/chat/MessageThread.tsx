"use client";

import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StoredConversation } from "@/lib/conversations";
import { Message } from "@/lib/types";

interface MessageThreadProps {
  conversation: StoredConversation;
  currentUserId: string;
}

export function MessageThread({ conversation, currentUserId }: MessageThreadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const scrollToBottom = (smooth = true) => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  useEffect(() => {
    const currentCount = conversation.messages?.length || 0;
    // Only scroll if message count changed or on initial load
    if (currentCount !== prevCountRef.current) {
      const container = containerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 180;
        if (prevCountRef.current === 0 || isNearBottom) {
          scrollToBottom(prevCountRef.current !== 0);
        }
      }
      prevCountRef.current = currentCount;
    }
  }, [conversation.messages?.length]);

  const getMemberInfo = (senderId: string) => {
    const member = conversation.members.find((m) => m.user_id === senderId);
    return {
      name: member?.user_name || "Campus Student",
      initials: member?.user_initials || member?.user_name?.[0] || "S",
      role: member?.role || "member",
    };
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950 overscroll-contain"
    >
      {/* Starting timestamp indicator */}
      <div className="flex justify-center my-1.5">
        <span className="text-[11px] font-medium bg-slate-200/70 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 border border-transparent dark:border-slate-700/60 px-3 py-1 rounded-full shadow-2xs">
          Conversation started • {new Date(conversation.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Messages Stream */}
      {conversation.messages.map((msg, idx) => {
        const isMe = msg.sender_id === currentUserId;
        const sender = getMemberInfo(msg.sender_id);
        const timeFormatted = new Date(msg.created_at).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={msg.id || idx}
            className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
          >
            {/* Other User Avatar */}
            {!isMe && (
              <Avatar className="h-8 w-8 shrink-0 border border-slate-200 dark:border-teal-500/30 shadow-2xs mb-1">
                <AvatarFallback className="bg-primary/10 dark:bg-teal-950 text-primary dark:text-teal-300 text-xs font-bold">
                  {sender.initials}
                </AvatarFallback>
              </Avatar>
            )}

            <div className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${isMe ? "items-end text-right" : "items-start text-left"}`}>
              {/* Sender Name in Group Chat */}
              {!isMe && (
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {sender.name}
                  </span>
                  {sender.role === "owner" && (
                    <span className="text-[9px] font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 px-1.5 py-0.2 rounded">
                      Owner
                    </span>
                  )}
                  {sender.role === "seller" && (
                    <span className="text-[9px] font-bold uppercase bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 px-1.5 py-0.2 rounded">
                      Seller
                    </span>
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm shadow-xs leading-relaxed ${
                  isMe
                    ? "bg-primary dark:bg-teal-600 text-white rounded-br-xs font-normal"
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1 block">
                {timeFormatted}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
