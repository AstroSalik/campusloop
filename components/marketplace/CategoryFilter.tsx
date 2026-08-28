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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "All Items", icon: LayoutGrid },
  { id: "furniture", label: "Furniture", icon: Home },
  { id: "cycles", label: "Cycles", icon: Bike },
  { id: "electronics", label: "Electronics", icon: Cpu },
  { id: "appliances", label: "Appliances", icon: Zap },
  { id: "books", label: "Books", icon: BookOpen },
  { id: "other", label: "Other", icon: Package },
];

const TYPES = [
  { id: "all", label: "All Types" },
  { id: "sell", label: "For Sale" },
  { id: "rent", label: "For Rent" },
  { id: "buy", label: "Wanted (Buy)" },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedType: string;
  onSelectType: (type: string) => void;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  selectedType,
  onSelectType,
}: CategoryFilterProps) {
  return (
    <div className="space-y-3.5">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border shrink-0",
                isSelected
                  ? "bg-primary text-white border-primary shadow-xs font-semibold"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-white" : "text-slate-400 dark:text-slate-400")} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Type Sub-Filter Tabs */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
          Type:
        </span>
        <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/60 dark:border-slate-700">
          {TYPES.map((t) => {
            const isSelected = selectedType.toLowerCase() === t.id.toLowerCase();
            return (
              <button
                key={t.id}
                onClick={() => onSelectType(t.id)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all",
                  isSelected
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
