"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Check, LogIn, Percent, Sparkles, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DemoUser, setClientDemoSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

interface SetupAllowanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAllowance?: number | null;
  currentUser?: DemoUser | null;
  onAllowanceSaved: (newAllowance: number) => void;
}

const PRESET_CHIPS = [8000, 12000, 15000, 20000, 25000];

export function SetupAllowanceDialog({
  open,
  onOpenChange,
  currentAllowance,
  currentUser,
  onAllowanceSaved,
}: SetupAllowanceDialogProps) {
  const router = useRouter();
  const [value, setValue] = useState(currentAllowance ? String(currentAllowance) : "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(currentAllowance ? String(currentAllowance) : "");
    }
  }, [open, currentAllowance]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid monthly allowance (e.g. ₹15,000).");
      return;
    }

    if (!currentUser) {
      toast.info("Please log in to save your monthly allowance.");
      onOpenChange(false);
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      // 1. Update Supabase users table
      const supabase = createClient();
      const { error } = await supabase
        .from("users")
        .update({ monthly_income: num })
        .eq("id", currentUser.id);

      if (error) {
        console.error("Supabase allowance update error:", error);
      }
    } catch (err) {
      console.error("Allowance update exception:", err);
    }

    // 2. Update local session & notify listeners
    const updatedUser: DemoUser = {
      ...currentUser,
      monthly_income: num,
    };
    setClientDemoSession(updatedUser);
    onAllowanceSaved(num);

    toast.success(`Monthly allowance set to ₹${num.toLocaleString("en-IN")}!`);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-teal-400">
              <Wallet className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Set Up Monthly Allowance
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Enter your monthly pocket money, stipend, or student budget. This is used by the Rent Health Engine to benchmark rent split affordability.
          </DialogDescription>
        </DialogHeader>

        {!currentUser ? (
          <div className="space-y-4 py-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4 text-center space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You are currently signed out. Please sign in to your student account to save your monthly allowance and view your personalized rent health snapshot.
              </p>
            </div>
            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  router.push("/login");
                }}
                className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5" />
                Go to Sign In
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 pt-1">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Monthly Allowance (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400">
                  ₹
                </span>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. 15000"
                  className="pl-8 text-base font-bold h-11 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Common Student Allowances:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CHIPS.map((preset) => {
                  const isSelected = Number(value) === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setValue(String(preset))}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                        isSelected
                          ? "bg-primary text-slate-950 font-bold border-primary shadow-2xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50"
                      }`}
                    >
                      ₹{preset.toLocaleString("en-IN")}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Note: This will also automatically update your student profile budget.
            </p>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !value}
                className="bg-primary hover:bg-primary/90 text-slate-950 font-bold text-xs gap-1.5 shadow-xs"
              >
                {saving ? "Saving..." : "Save Allowance"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
