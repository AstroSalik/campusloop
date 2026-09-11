"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  Compass, 
  LogIn, 
  MapPin, 
  Menu,
  MessageSquare, 
  Percent, 
  Search, 
  ShoppingBag, 
  Users2 
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getClientDemoSession, clearClientDemoSession, DemoUser } from "@/lib/auth";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { useUserLocation } from "@/lib/useUserLocation";
import { useUnreadMessageCount } from "@/lib/useUnreadMessageCount";

export function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { unreadCount } = useUnreadMessageCount();
  const { location: userLoc, detectLocation, loading: detectingLoc, mounted: locationMounted } = useUserLocation();

  const handleHeaderLocationClick = async () => {
    toast.info("Refreshing your current GPS location...");
    const detected = await detectLocation();
    if (detected && detected.label) {
      toast.success(`Current location updated: ${detected.label}`);
    }
  };

  const handleSignOut = () => {
    clearClientDemoSession();
    setCurrentUser(null);
    toast.success("Signed out successfully.");
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
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
          {/* Brand Wordmark & Location */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl bg-primary text-white shadow-xs transition-transform group-hover:scale-105 shrink-0">
                <Compass className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  Campus<span className="text-primary">Loop</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5 hidden xs:inline-block">
                  Living & Marketplace
                </span>
              </div>
            </Link>

            {/* GPS Location Pill - Shown on xl+ desktop only to protect laptop viewport */}
            <button
              type="button"
              onClick={handleHeaderLocationClick}
              title="Click to detect & update your current GPS location"
              suppressHydrationWarning
              className="hidden xl:inline-flex items-center gap-1.5 py-1 px-3 bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 rounded-full text-xs font-medium transition-all group"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${detectingLoc ? "bg-amber-500 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
              <MapPin className="h-3 w-3 text-primary group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-[150px]" suppressHydrationWarning>
                {detectingLoc ? "Detecting GPS..." : (locationMounted ? (userLoc?.label || "Demo Campus — Sopore") : "Demo Campus — Sopore")}
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links - Adaptive across laptops (lg) and desktops (xl) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-slate-100/90 text-primary font-semibold dark:bg-primary/20 dark:text-teal-300"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0", isActive ? "text-primary dark:text-teal-300" : "text-slate-500 dark:text-slate-400")} />
                  <span>{link.label}</span>
                  {link.href === "/messages" && unreadCount > 0 && (
                    <span className="ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white px-1 shadow-xs animate-in zoom-in-50">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Global Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center gap-2 h-9 px-2.5 sm:px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100/90 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 dark:text-slate-300 text-xs font-medium transition-all shadow-2xs group"
              title="Search CampusLoop (⌘K)"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary dark:group-hover:text-teal-300 transition-colors" />
              <span className="hidden sm:inline text-slate-500 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-white">
                Search...
              </span>
              <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs group-hover:text-slate-600 dark:group-hover:text-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Light / Dark Mode Theme Toggle */}
            <ThemeToggle />

            {/* Profile Avatar or Sign In Button */}
            {currentUser ? (
              <Link 
                href="/profile" 
                className="relative flex items-center justify-center shrink-0 w-9 h-9 min-w-[36px] max-w-[36px] min-h-[36px] max-h-[36px] rounded-full overflow-hidden hover:opacity-90 transition-opacity"
                title={`${currentUser.name} (${currentUser.role_desc})`}
              >
                <div className="relative w-9 h-9 min-w-[36px] max-w-[36px] min-h-[36px] max-h-[36px] rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 ring-2 ring-primary/20 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      width={36}
                      height={36}
                      className="w-full h-full max-w-full max-h-full object-cover rounded-full select-none block pointer-events-none"
                      style={{
                        width: "36px",
                        height: "36px",
                        minWidth: "36px",
                        maxWidth: "36px",
                        minHeight: "36px",
                        maxHeight: "36px",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <span className="text-primary dark:text-teal-300 font-bold text-xs uppercase select-none">
                      {currentUser.initials ||
                        currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 h-9 px-2.5 sm:px-3.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 active:scale-98 transition-all shadow-xs shrink-0 whitespace-nowrap"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign In / Sign Up</span>
                <span className="sm:hidden">Sign In</span>
              </Link>
            )}

            {/* Mobile & Tablet Hamburger Drawer Button (visible on < lg) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="relative lg:hidden flex h-9 w-9 min-w-[36px] max-w-[36px] shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal 
        open={isSearchOpen} 
        onOpenChange={setIsSearchOpen} 
      />

      {/* Mobile & Tablet Slide-Over Drawer */}
      <MobileNavDrawer
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenSearch={() => setIsSearchOpen(true)}
        locationLabel={locationMounted ? (userLoc?.label || "Demo Campus — Sopore") : "Demo Campus — Sopore"}
        detectingLocation={detectingLoc}
        onDetectLocation={detectLocation}
      />
    </>
  );
}
