"use client";

import { useState, useEffect } from "react";

export type AppMode = "buyer" | "seller";

const MODE_STORAGE_KEY = "campusloop_app_mode";

export function getAppMode(): AppMode {
  if (typeof window === "undefined") return "buyer";
  try {
    return (localStorage.getItem(MODE_STORAGE_KEY) as AppMode) || "buyer";
  } catch (e) {
    return "buyer";
  }
}

export function setAppMode(mode: AppMode) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
      window.dispatchEvent(new Event("campusloop_mode_change"));
    } catch (e) {}
  }
}

export function useAppMode(): [AppMode, (mode: AppMode) => void] {
  const [mode, setModeState] = useState<AppMode>("buyer");

  useEffect(() => {
    setModeState(getAppMode());

    const handleModeChange = () => {
      setModeState(getAppMode());
    };

    window.addEventListener("campusloop_mode_change", handleModeChange);
    window.addEventListener("storage", handleModeChange);

    return () => {
      window.removeEventListener("campusloop_mode_change", handleModeChange);
      window.removeEventListener("storage", handleModeChange);
    };
  }, []);

  const updateMode = (newMode: AppMode) => {
    setAppMode(newMode);
    setModeState(newMode);
  };

  return [mode, updateMode];
}
