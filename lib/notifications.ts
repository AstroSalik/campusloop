"use client";

import { toast } from "sonner";
import { Message } from "@/lib/types";

/**
 * Web Audio API synthesized notification chime.
 * Two-tone pleasant chime (587.33 Hz [D5] -> 880 Hz [A5]) with sweet decay,
 * identical to modern chat notification chimes (WhatsApp / iMessage / Slack).
 * Requires zero external audio files, zero network latency, zero 404s.
 */
export function playMessageNotificationSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);

    // Tone 2: 880.00 Hz (A5) - brighter harmonic resolution
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.08);
    gain2.gain.setValueAtTime(0.18, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.38);
  } catch (e) {
    // Graceful fallback if AudioContext is restricted by browser policy
  }
}

export interface NotifyIncomingMessageOptions {
  message: Message;
  senderName: string;
  senderAvatar?: string | null;
  senderInitials?: string;
  conversationTitle?: string;
  conversationId: string;
  onOpen?: () => void;
}

/**
 * Dispatches an audible chime + high-visibility interactive toast alert
 * and system Notification (if granted).
 */
export function notifyIncomingMessage({
  message,
  senderName,
  senderInitials,
  conversationTitle,
  conversationId,
  onOpen,
}: NotifyIncomingMessageOptions) {
  // 1. Play chime audio alert
  playMessageNotificationSound();

  const previewText =
    message.content.length > 70
      ? message.content.slice(0, 67) + "..."
      : message.content;

  // 2. Interactive Sonner Toast Alert
  toast(senderName, {
    description: previewText,
    duration: 5000,
    action: {
      label: "Reply",
      onClick: () => {
        if (onOpen) {
          onOpen();
        } else if (typeof window !== "undefined") {
          window.location.href = `/messages/${conversationId}`;
        }
      },
    },
  });

  // 3. Native OS notification if allowed
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    try {
      const n = new Notification(senderName, {
        body: previewText,
        icon: "/favicon.ico",
        tag: `campusloop-chat-${conversationId}`,
      });
      n.onclick = () => {
        window.focus();
        if (onOpen) {
          onOpen();
        } else {
          window.location.href = `/messages/${conversationId}`;
        }
        n.close();
      };
    } catch (e) {}
  }
}

/**
 * Ask the student for permission to deliver OS notifications for messages
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  try {
    const result = await Notification.requestPermission();
    return result === "granted";
  } catch (e) {
    return false;
  }
}
