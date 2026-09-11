"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  Home, 
  MessageSquare, 
  ShoppingBag, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  // Hide BottomNav when user is inside a specific conversation thread
  // so the message input is sticky to the actual device bottom
  if (pathname.startsWith("/messages/") && pathname !== "/messages") {
    return null;
  }

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/marketplace", label: "Market", icon: ShoppingBag },
    { href: "/housing", label: "Housing", icon: Building2 },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-slate-900/85 shadow-lg safe-bottom">
      <div className="flex h-16 items-center justify-around px-2 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 transition-colors min-w-0",
                isActive
                  ? "text-primary font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-full transition-transform",
                  isActive && "bg-primary/10 dark:bg-primary/20 scale-105"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-primary stroke-[2.5]" : "text-slate-500 dark:text-slate-400"
                  )}
                />
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight mt-0.5 truncate max-w-[60px] text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
