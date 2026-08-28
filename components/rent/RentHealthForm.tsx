"use client";

import React from "react";
import { 
  Building2, 
  DollarSign, 
  HelpCircle, 
  Percent, 
  RotateCcw, 
  Sparkles, 
  Users, 
  Wallet, 
  Zap 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RentHealthFormProps {
  monthlyIncome: number;
  setMonthlyIncome: (v: number) => void;
  rent: number;
  setRent: (v: number) => void;
  utilities: number;
  setUtilities: (v: number) => void;
  maintenance: number;
  setMaintenance: (v: number) => void;
  occupants: number;
  setOccupants: (v: number) => void;
  onReset?: () => void;
}

export function RentHealthForm({
  monthlyIncome,
  setMonthlyIncome,
  rent,
  setRent,
  utilities,
  setUtilities,
  maintenance,
  setMaintenance,
  occupants,
  setOccupants,
  onReset,
}: RentHealthFormProps) {
  const PRESETS = [
    { label: "Single Room PG", rent: 8000, utils: 800, maint: 400, occ: 1 },
    { label: "2BHK (3 Flatmates)", rent: 18000, utils: 1500, maint: 900, occ: 3 },
    { label: "3BHK (4 Flatmates)", rent: 24000, utils: 2000, maint: 1000, occ: 4 },
  ];

  const applyPreset = (p: typeof PRESETS[0]) => {
    setRent(p.rent);
    setUtilities(p.utils);
    setMaintenance(p.maint);
    setOccupants(p.occ);
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Rent & Split Inputs
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter rent, utility estimates, and number of flatmates sharing costs.
            </CardDescription>
          </div>
          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 h-8 gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary dark:text-teal-400" />
            Quick Campus Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs font-semibold py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/5 dark:hover:bg-primary/20 hover:border-primary/40 dark:hover:border-primary/50 hover:text-primary dark:hover:text-teal-300 transition-all text-center"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Income / Allowance */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Your Monthly Allowance / Income (₹) *
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Total monthly budget</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">₹</span>
            <Input
              type="number"
              value={monthlyIncome || ""}
              onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
              className="pl-7 font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10"
              placeholder="15000"
            />
          </div>
        </div>

        {/* Rent & Utilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Total Flat Monthly Rent (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">₹</span>
              <Input
                type="number"
                value={rent || ""}
                onChange={(e) => setRent(Number(e.target.value) || 0)}
                className="pl-7 font-semibold h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="18000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Est. Monthly Utilities (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">₹</span>
              <Input
                type="number"
                value={utilities || ""}
                onChange={(e) => setUtilities(Number(e.target.value) || 0)}
                className="pl-7 h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="1500"
              />
            </div>
          </div>
        </div>

        {/* Maintenance & Roommates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Society Maintenance (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">₹</span>
              <Input
                type="number"
                value={maintenance || ""}
                onChange={(e) => setMaintenance(Number(e.target.value) || 0)}
                className="pl-7 h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Total Occupants Sharing Split
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setOccupants(num)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    occupants === num
                      ? "bg-primary text-white border-primary shadow-2xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {num} {num === 1 ? "Solo" : "People"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
