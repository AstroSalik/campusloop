"use client";

import React, { useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ConversationType } from "@/lib/types";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  isHousing?: boolean;
  conversationType?: ConversationType | "marketplace";
  isOwnerOrSeller?: boolean;
  isBlocked?: boolean;
  isBlockedByOther?: boolean;
  onUnblock?: () => void;
  peerName?: string;
  initialDraft?: string;
}

export function MessageInput({ 
  onSendMessage, 
  disabled, 
  isHousing, 
  conversationType = isHousing ? "housing_group" : "marketplace_dm",
  isOwnerOrSeller = false,
  isBlocked = false,
  isBlockedByOther = false,
  onUnblock,
  peerName = "this student",
  initialDraft = ""
}: MessageInputProps) {
  const [content, setContent] = useState(initialDraft);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pending = useRef(false);

  if (isBlocked) {
    return (
      <div className="border-t border-slate-200/80 dark:border-slate-800 bg-amber-50/70 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Send className="h-4 w-4 rotate-45 opacity-50" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              You have blocked {peerName}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Unblock them to resume messaging and sending replies.
            </p>
          </div>
        </div>
        {onUnblock && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onUnblock}
            className="shrink-0 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs font-semibold"
          >
            Unblock {peerName}
          </Button>
        )}
      </div>
    );
  }

  if (isBlockedByOther) {
    return (
      <div className="border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 text-center">
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
          You cannot send messages to this student at this time.
        </p>
      </div>
    );
  }

  const getQuickPrompts = () => {
    if (conversationType === "housing_group") {
      if (isOwnerOrSeller) {
        return [
          "Yes, a spot is open! When can you come visit?",
          "Utilities & maintenance come to ~₹1,200/person.",
          "You can drop by tomorrow around 5 PM to see the flat.",
          "Welcome to the group! Let me know if you have questions.",
        ];
      }
      return [
        "Hi everyone! Is this room spot still available?",
        "When can I visit to see the flat and meet flatmates?",
        "What is the total monthly split for rent & utilities?",
        "I'm interested and ready to move in next month!",
      ];
    }

    if (conversationType === "roommate_dm") {
      return [
        "Hey! Are you still looking for a flatmate?",
        "What's your preferred budget and move-in timeline?",
        "Let's team up to search for a 2BHK/3BHK near campus!",
        "Are you free to meet at the campus cafeteria?",
      ];
    }

    // Marketplace conversation
    if (isOwnerOrSeller) {
      return [
        "Yes, it's still available! When would you like to pick it up?",
        "I can meet you at Hostel 3 or Main Gate today.",
        "Price is fixed, but it's in mint working condition.",
        "Done! I'll hold it for you until this evening.",
      ];
    }

    return [
      "Hi! Is this still available?",
      "Can you do a slight student discount?",
      "Where on campus can we meet to inspect it?",
      "Deal! I can pick it up today.",
    ];
  };

  const quickPrompts = getQuickPrompts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || pending.current || !content.trim()) return;
    pending.current = true;
    setSending(true);
    setError("");
    try {
      await onSendMessage(content.trim());
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your message could not be sent. Try again.");
    } finally {
      pending.current = false;
      setSending(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setContent(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 space-y-2.5">
      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-teal-400 shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary dark:text-teal-400" />
          {isOwnerOrSeller ? "Seller Quick Reply:" : "Quick Reply:"}
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled || sending}
            onClick={() => handleQuickPrompt(p)}
            className="text-xs shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-200 hover:bg-primary/10 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-teal-300 transition-colors border border-slate-200/60 dark:border-slate-700 font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Main Text Input */}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          ref={inputRef}
          aria-label="Message"
          maxLength={2000}
          placeholder="Type your message... (Press Enter to send)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={disabled || sending}
          className="h-10 bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-800"
        />
        <Button
          type="submit"
          size="sm"
          disabled={disabled || sending || !content.trim()}
          className="h-10 px-4 shrink-0 bg-primary dark:bg-teal-600 hover:dark:bg-teal-500 text-white font-bold shadow-xs"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
