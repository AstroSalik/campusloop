"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Flame, 
  MessageSquare, 
  Package, 
  ShoppingBag, 
  Sparkles, 
  X 
} from "lucide-react";
import { getClientDemoSession, DemoUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CampusNotification {
  id: string;
  user_id: string;
  type: "restock_request" | "purchase" | "message" | "system";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(() => getClientDemoSession());
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for auth changes
  useEffect(() => {
    const handleAuth = () => setCurrentUser(getClientDemoSession());
    window.addEventListener("campusloop_auth_changed", handleAuth);
    return () => window.removeEventListener("campusloop_auth_changed", handleAuth);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          // Merge with any local notification records
          const localRaw = localStorage.getItem(`campusloop_notifs_${currentUser.id}`);
          const localList: CampusNotification[] = localRaw ? JSON.parse(localRaw) : [];
          
          const combinedMap = new Map<string, CampusNotification>();
          data.notifications.forEach((n: CampusNotification) => combinedMap.set(n.id, n));
          localList.forEach((n: CampusNotification) => combinedMap.set(n.id, n));

          const combined = Array.from(combinedMap.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          setNotifications(combined);
        }
      }
    } catch {
      // Fallback to local storage
      const localRaw = localStorage.getItem(`campusloop_notifs_${currentUser?.id}`);
      if (localRaw) {
        setNotifications(JSON.parse(localRaw));
      }
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleEvent = () => fetchNotifications();
    window.addEventListener("campusloop_notifications_updated", handleEvent);
    const interval = setInterval(fetchNotifications, 15000); // 15s refresh
    return () => {
      window.removeEventListener("campusloop_notifications_updated", handleEvent);
      clearInterval(interval);
    };
  }, [currentUser]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    if (currentUser) {
      try {
        const localRaw = localStorage.getItem(`campusloop_notifs_${currentUser.id}`);
        if (localRaw) {
          const list: CampusNotification[] = JSON.parse(localRaw);
          const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
          localStorage.setItem(`campusloop_notifs_${currentUser.id}`, JSON.stringify(updated));
        }
      } catch {}

      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_read", id, userId: currentUser.id }),
        });
      } catch {}
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    if (currentUser) {
      try {
        const localRaw = localStorage.getItem(`campusloop_notifs_${currentUser.id}`);
        if (localRaw) {
          const list: CampusNotification[] = JSON.parse(localRaw);
          const updated = list.map((n) => ({ ...n, read: true }));
          localStorage.setItem(`campusloop_notifs_${currentUser.id}`, JSON.stringify(updated));
        }
      } catch {}

      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_all_read", userId: currentUser.id }),
        });
      } catch {}
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-2xs group shrink-0",
          isOpen && "border-primary text-primary dark:text-teal-300 bg-primary/10"
        )}
        title="Notifications & Alerts"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 group-hover:scale-105 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-primary hover:underline dark:text-teal-400 flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  You&apos;re all caught up!
                </p>
                <p className="text-[11px] text-slate-500">
                  You&apos;ll be notified here when peers buy your items or request restocks.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isRestock = notif.type === "restock_request";
                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={cn(
                      "p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3 cursor-pointer",
                      !notif.read && "bg-teal-50/40 dark:bg-teal-950/20"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        isRestock
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-primary/10 text-primary dark:text-teal-300"
                      )}
                    >
                      {isRestock ? (
                        <Flame className="h-4 w-4" />
                      ) : notif.type === "purchase" ? (
                        <ShoppingBag className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={() => setIsOpen(false)}
                            className="text-[11px] font-bold text-primary hover:underline dark:text-teal-400"
                          >
                            {isRestock ? "Restock Item →" : "View Details →"}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              View My Seller Profile & Stock →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
