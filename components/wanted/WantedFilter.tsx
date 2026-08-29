"use client";

import React from "react";
import { 
  Bike, 
  BookOpen, 
  Cpu, 
  Home, 
  LayoutGrid, 
  Package, 
  Sparkles, 
  Zap 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WantedFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  { id: "all", label: "All Requests", icon: LayoutGrid },
  { id: "furniture", label: "Furniture", icon: Home },
  { id: "cycles", label: "Cycles", icon: Bike },
  { id: "electronics", label: "Electronics", icon: Cpu },
  { id: "appliances", label: "Appliances", icon: Zap },
  { id: "books", label: "Books", icon: BookOpen },
  { id: "other", label: "Other", icon: Package },
];

export function WantedFilter({
  selectedCategory,
  onSelectCategory,
}: WantedFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0",
              isSelected
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-white" : "text-slate-400 dark:text-slate-400")} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
