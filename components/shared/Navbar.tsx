"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  Compass, 
  LogIn, 
  MapPin, 
  MessageSquare, 
  Percent, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  User, 
  Users2 
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getClientDemoSession, DemoUser } from "@/lib/auth";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { ThemeToggle } from "./ThemeToggle";
import { useUserLocation } from "@/lib/useUserLocation";

export function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { location: userLoc, detectLocation, loading: detectingLoc, mounted: locationMounted } = useUserLocation();

  const handleHeaderLocationClick = async () => {
    toast.info("Refreshing your current GPS location...");
    const detected = await detectLocation();
    if (detected && detected.label) {
      toast.success(`Current location updated: ${detected.label}`);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const user = getClientDemoSession();
      setCurrentUser(user);
    };
    checkAuth();

    window.addEventListener("campusloop_auth_changed", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("campusloop_auth_changed", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname]);

  // Global Keyboard Shortcut: ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/housing", label: "Housing", icon: Building2 },
    { href: "/roommates", label: "Roommates", icon: Users2 },
    { href: "/rent", label: "Rent Health", icon: Percent },
    { href: "/messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 dark:bg-slate-900/95 dark:border-slate-800 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-xs">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand Wordmark & Campus Location Badge */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-primary text-white shadow-xs transition-transform group-hover:scale-105">
                <Compass className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  Campus<span className="text-primary">Loop</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">
                  Living & Marketplace
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleHeaderLocationClick}
              title="Click to detect & update your current GPS location"
              suppressHydrationWarning
              className="hidden lg:inline-flex items-center gap-1.5 py-1 px-3 bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 rounded-full text-xs font-medium transition-all group"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${detectingLoc ? "bg-amber-500 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
              <MapPin className="h-3 w-3 text-primary group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-[170px]" suppressHydrationWarning>
                {detectingLoc ? "Detecting GPS..." : (locationMounted ? (userLoc?.label || "Demo Campus — Sopore") : "Demo Campus — Sopore")}
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-slate-100/90 text-primary font-semibold dark:bg-primary/20 dark:text-teal-300"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary dark:text-teal-300" : "text-slate-500 dark:text-slate-400")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5">
            {/* Global Search Trigger with ⌘K Badge */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 h-9 px-3 sm:px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100/90 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 dark:text-slate-300 text-xs font-medium transition-all shadow-2xs group"
              title="Search CampusLoop (⌘K)"
            >
              <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary dark:group-hover:text-teal-300 transition-colors" />
              <span className="hidden sm:inline text-slate-500 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-white">Search campus...</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs group-hover:text-slate-600 dark:group-hover:text-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Light / Dark Mode Theme Toggle */}
            <ThemeToggle />

            {/* Profile Avatar or Sign In / Sign Up Button */}
            {currentUser ? (
              <Link 
                href="/profile" 
                className="flex items-center gap-2 pl-0.5 hover:opacity-90 transition-opacity"
                title={`${currentUser.name} (${currentUser.role_desc})`}
              >
                <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700 ring-2 ring-transparent hover:ring-primary/20 transition-all shadow-2xs">
                  <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300 font-bold text-xs">
                    {currentUser.initials ||
                      currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 active:scale-98 transition-all shadow-xs shrink-0 whitespace-nowrap"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In / Sign Up</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal 
        open={isSearchOpen} 
        onOpenChange={setIsSearchOpen} 
      />
    </>
  );
}
