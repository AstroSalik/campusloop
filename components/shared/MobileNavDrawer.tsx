"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Compass,
  Home,
  LogIn,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  Percent,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  Users2,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DemoUser } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  currentUser: DemoUser | null;
  onSignOut: () => void;
  onOpenSearch: () => void;
  locationLabel: string;
  detectingLocation: boolean;
  onDetectLocation: () => void;
}

export function MobileNavDrawer({
  open,
  onClose,
  currentUser,
  onSignOut,
  onOpenSearch,
  locationLabel,
  detectingLocation,
  onDetectLocation,
}: MobileNavDrawerProps) {
  const pathname = usePathname();
  const prevPathRef = React.useRef(pathname);

  // Close drawer only when user navigates to a new route
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const mainLinks = [
    { href: "/", label: "Home Hub", icon: Home },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag, badge: "Buy & Sell" },
    { href: "/housing", label: "Flats & Hostels", icon: Building2, badge: "PGs" },
    { href: "/roommates", label: "Roommate Finder", icon: Users2 },
    { href: "/rent", label: "Rent Health Engine", icon: Percent, badge: "Calculator" },
    { href: "/wanted", label: "Wanted Requests", icon: Sparkles },
    { href: "/messages", label: "Messages & Chat", icon: MessageSquare },
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] lg:hidden transition-all duration-300 ease-in-out",
        open ? "pointer-events-auto visible" : "pointer-events-none invisible"
      )}
      aria-hidden={!open}
    >
      {/* Backdrop overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ease-out",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel with smooth sliding transition */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[60] w-full max-w-[320px] sm:max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto no-scrollbar transition-transform duration-300 ease-out transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Top Header */}
        <div>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link href="/" onClick={onClose} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                Campus<span className="text-primary">Loop</span>
              </span>
            </Link>

            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* User Profile Banner or Sign In */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 min-w-[40px] max-w-[40px] min-h-[40px] max-h-[40px] shrink-0 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        width={40}
                        height={40}
                        className="w-full h-full max-w-full max-h-full object-cover rounded-full select-none block"
                        style={{
                          width: "40px",
                          height: "40px",
                          minWidth: "40px",
                          maxWidth: "40px",
                          minHeight: "40px",
                          maxHeight: "40px",
                          objectFit: "cover"
                        }}
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {currentUser.initials ||
                          currentUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.role_desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 flex-1 text-xs font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    onClick={onClose}
                  >
                    <Link href="/profile">
                      <User className="mr-1.5 h-3.5 w-3.5" />
                      View Profile
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => {
                      onSignOut();
                      onClose();
                    }}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sign in to post items, message peers, and view student itineraries.
                </p>
                <Button asChild size="sm" className="w-full h-9 font-semibold text-xs gap-1.5 shadow-xs" onClick={onClose}>
                  <Link href="/login">
                    <LogIn className="h-3.5 w-3.5" />
                    Sign In / Student Register
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Location Bar */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onDetectLocation}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-left"
            >
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[200px] font-medium">
                {detectingLocation ? "Detecting GPS..." : locationLabel}
              </span>
            </button>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              GPS
            </span>
          </div>

          {/* Search Trigger */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="w-full flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs font-medium"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search listings, rooms, requests...</span>
            </button>
          </div>

          {/* Main Navigation Links */}
          <div className="p-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Campus Features
            </div>
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300 font-semibold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary dark:text-teal-300" : "text-slate-400 dark:text-slate-400"
                      )}
                    />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions / Create */}
          <div className="p-3 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Quick Actions
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <Link
                href={currentUser ? "/marketplace/new" : "/login?redirect=/marketplace/new"}
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 text-xs font-semibold hover:bg-teal-100/80 transition-colors border border-teal-200/60 dark:border-teal-800"
              >
                <Plus className="h-3.5 w-3.5 text-teal-600" />
                <span>Post Item for Sale / Rent</span>
              </Link>
              <Link
                href={currentUser ? "/housing/new" : "/login?redirect=/housing/new"}
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 text-xs font-semibold hover:bg-indigo-100/80 transition-colors border border-indigo-200/60 dark:border-indigo-800"
              >
                <Plus className="h-3.5 w-3.5 text-indigo-600" />
                <span>List a Flat or PG Room</span>
              </Link>
              <Link
                href={currentUser ? "/wanted/new" : "/login?redirect=/wanted/new"}
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-semibold hover:bg-amber-100/80 transition-colors border border-amber-200/60 dark:border-amber-800"
              >
                <Plus className="h-3.5 w-3.5 text-amber-600" />
                <span>Post Wanted Request</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Drawer Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            CampusLoop &bull; Student Living & Marketplace
          </p>
        </div>
      </div>
    </div>
  );
}
