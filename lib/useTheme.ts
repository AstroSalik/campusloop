"use client";

import { useState, useEffect } from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "campusloop_theme";
const THEME_RESET_KEY = "campusloop_default_light_v1";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const hasAppliedDefaultLight = localStorage.getItem(THEME_RESET_KEY);
      
      if (!hasAppliedDefaultLight) {
        // Enforce light mode as the default for all users, overriding any legacy dark auto-detection
        localStorage.setItem(THEME_RESET_KEY, "true");
        localStorage.setItem(THEME_STORAGE_KEY, "light");
        setTheme("light");
        applyTheme("light");
        return;
      }

      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === "dark") {
        setTheme("dark");
        applyTheme("dark");
      } else {
        // Default strictly to light mode
        setTheme("light");
        applyTheme("light");
      }
    } catch (e) {
      applyTheme("light");
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
        setTheme(e.newValue);
        applyTheme(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const applyTheme = (t: Theme) => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (t === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
      localStorage.setItem(THEME_RESET_KEY, "true");
      window.dispatchEvent(new Event("campusloop_theme_changed"));
    } catch (e) {}
  };

  const setExplicitTheme = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
      localStorage.setItem(THEME_RESET_KEY, "true");
      window.dispatchEvent(new Event("campusloop_theme_changed"));
    } catch (e) {}
  };

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme: setExplicitTheme,
    mounted,
  };
}
