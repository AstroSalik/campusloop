"use client";

import React from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Info, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Wallet 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { AffordabilityBadge } from "./AffordabilityBadge";
import { RentCalculationResult } from "@/lib/rent-engine";

interface RentHealthResultProps {
  assessment: RentCalculationResult;
  totalCost: number;
  perPersonShare: number;
  occupants: number;
  monthlyIncome: number;
  onSave?: () => void;
  saved?: boolean;
  onPayShare?: () => void;
}

export function RentHealthResult({
  assessment,
  totalCost,
  perPersonShare,
  occupants,
  monthlyIncome,
  onSave,
  saved,
  onPayShare,
}: RentHealthResultProps) {
  const { flag, flagLabel, flagEmoji, housingRatioPct } = assessment;

  // Tailored human guidance sentence per PRD Section 4 & Flow C
  const getHumanSentence = () => {
    switch (flag) {
      case "comfortable":
        return "Excellent financial health! Your rent is well within the recommended 30% student benchmark, leaving plenty of buffer for meals, books, and savings.";
      case "moderate":
        return "This accommodation is affordable, but your monthly buffer is relatively limited. Keep an eye on variable electricity and winter heating spikes.";
      case "high":
        return "High housing burden: rent consumes over 40% of your allowance. Consider adding another flatmate to lower the per-person share.";
      case "heavy":
        return "Heavy housing burden: exceeds 50% of your monthly income. High risk of student budget distress; strongly consider lower-rent options.";
    }
  };

  // Calculate percentage pointer position on 0-100 gauge (capped at 100)
  const meterPercentage = Math.min(Math.max(housingRatioPct, 0), 100);

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary dark:text-teal-400" />
              Rent Health Assessment
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Deterministic affordability calculation based on your monthly income.
            </CardDescription>
          </div>
          <AffordabilityBadge flag={flag} percentage={housingRatioPct} />
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Big 3 Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Cost */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 p-4 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5 text-slate-400" />
              Total Flat Expenses
            </span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ₹{totalCost.toLocaleString("en-IN")}
            </p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              Rent + Utilities + Maintenance
            </span>
          </div>

          {/* Your Split Share */}
          <div className="rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/[0.04] dark:bg-primary/10 p-4 space-y-1">
            <span className="text-xs text-primary dark:text-teal-300 font-bold flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-primary dark:text-teal-300" />
              Your Monthly Share
            </span>
            <p className="text-2xl font-extrabold text-primary dark:text-teal-300">
              ₹{perPersonShare.toLocaleString("en-IN")}
            </p>
            <span className="text-[11px] text-primary/80 dark:text-teal-300/80 font-medium block">
              Split {occupants} way{occupants > 1 ? "s" : ""} equally
            </span>
          </div>

          {/* Housing Burden Ratio */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 p-4 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
              Income Ratio
            </span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {housingRatioPct}%
            </p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              Of ₹{monthlyIncome.toLocaleString("en-IN")} allowance
            </span>
          </div>
        </div>

        {/* 4-Tier Visual Threshold Meter */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Affordability Gauge</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              Current: <strong>{housingRatioPct}%</strong> ({flagLabel})
            </span>
          </div>

          {/* Color Bar */}
          <div className="relative h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
            <div className="h-full bg-emerald-500 w-[30%]" title="Comfortable (0-30%)" />
            <div className="h-full bg-amber-500 w-[10%]" title="Moderate (30-40%)" />
            <div className="h-full bg-orange-500 w-[10%]" title="High (40-50%)" />
            <div className="h-full bg-red-500 w-[50%]" title="Heavy (50%+)" />
          </div>

          {/* Ticks and Labels */}
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 px-0.5">
            <span>0%</span>
            <span className="text-emerald-700 dark:text-emerald-400">30% (Comfortable)</span>
            <span className="text-amber-700 dark:text-amber-400">40% (Moderate)</span>
            <span className="text-orange-700 dark:text-orange-400">50% (High)</span>
            <span className="text-red-700 dark:text-red-400">100% (Heavy)</span>
          </div>
        </div>

        {/* Human Guidance Box */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 p-4 flex items-start gap-3">
          <div className="text-xl shrink-0 mt-0.5">{flagEmoji}</div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Campus Advisor Insight
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {getHumanSentence()}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 p-4 flex flex-wrap gap-2 justify-between items-center">
        {onPayShare && (
          <button
            type="button"
            onClick={onPayShare}
            className="text-xs font-bold px-4 py-2 rounded-lg bg-[#3395ff] hover:bg-[#287bd5] text-white shadow-xs transition-all"
          >
            Pay Rent Share (Razorpay)
          </button>
        )}

        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saved}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
              saved
                ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
            }`}
          >
            {saved ? "✓ Saved to History" : "Save Calculation"}
          </button>
        )}
      </CardFooter>
    </Card>
  );
}
