import React from "react";
import { ShoppingBag, Store } from "lucide-react";
import { useAppMode, AppMode } from "@/lib/useAppMode";

interface ModeToggleProps {
  mode?: AppMode;
  onModeChange?: (mode: AppMode) => void;
  buyerLabel?: string;
  sellerLabel?: string;
  className?: string;
}

export function ModeToggle({
  mode: controlledMode,
  onModeChange: controlledOnModeChange,
  buyerLabel = "Buyer Mode",
  sellerLabel = "Seller Mode",
  className = "",
}: ModeToggleProps) {
  const [globalMode, setGlobalMode] = useAppMode();

  const currentMode = controlledMode !== undefined ? controlledMode : globalMode;
  const handleModeChange = (newMode: AppMode) => {
    if (controlledOnModeChange) {
      controlledOnModeChange(newMode);
    } else {
      setGlobalMode(newMode);
    }
  };

  return (
    <div
      className={`inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs ${className}`}
    >
      <button
        type="button"
        onClick={() => handleModeChange("buyer")}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          currentMode === "buyer"
            ? "bg-white dark:bg-slate-900 text-primary shadow-xs font-bold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        {buyerLabel}
      </button>

      <button
        type="button"
        onClick={() => handleModeChange("seller")}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          currentMode === "seller"
            ? "bg-white dark:bg-slate-900 text-primary shadow-xs font-bold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        <Store className="h-3.5 w-3.5" />
        {sellerLabel}
      </button>
    </div>
  );
}
