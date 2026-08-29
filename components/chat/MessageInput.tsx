"use client";

import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ConversationType } from "@/lib/types";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  isHousing?: boolean;
  conversationType?: ConversationType | "marketplace";
  isOwnerOrSeller?: boolean;
}

export function MessageInput({ 
  onSendMessage, 
  disabled, 
  isHousing, 
  conversationType = isHousing ? "housing_group" : "marketplace_dm",
  isOwnerOrSeller = false 
}: MessageInputProps) {
  const [content, setContent] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSendMessage(content.trim());
    setContent("");
  };

  const handleQuickPrompt = (prompt: string) => {
    onSendMessage(prompt);
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
            onClick={() => handleQuickPrompt(p)}
            className="text-xs shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-200 hover:bg-primary/10 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-teal-300 transition-colors border border-slate-200/60 dark:border-slate-700 font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Main Text Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          placeholder="Type your message... (Press Enter to send)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={disabled}
          className="h-10 bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-800"
        />
        <Button
          type="submit"
          size="sm"
          disabled={disabled || !content.trim()}
          className="h-10 px-4 shrink-0 bg-primary dark:bg-teal-600 hover:dark:bg-teal-500 text-white font-bold shadow-xs"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
