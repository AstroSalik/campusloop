"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggleTheme, mounted } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
      className={`h-9 w-9 p-0 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all ${className || ""}`}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4 text-amber-400 rotate-0 scale-100 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 text-slate-600 rotate-0 scale-100 transition-transform duration-300 hover:-rotate-12" />
        )
      ) : (
        <Sun className="h-4 w-4 opacity-0" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
