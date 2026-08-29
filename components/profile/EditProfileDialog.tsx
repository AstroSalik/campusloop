"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { 
  Building2, 
  DollarSign, 
  Edit3, 
  Image as ImageIcon, 
  Mail, 
  Sparkles, 
  User as UserIcon, 
  Wallet 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DemoUser, setClientDemoSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

interface EditProfileDialogProps {
  user: DemoUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated: (updated: DemoUser) => void;
}

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const [name, setName] = useState(user.name);
  const [monthlyIncome, setMonthlyIncome] = useState(String(user.monthly_income || 15000));
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "");
  const [saving, setSaving] = useState(false);

  const calculateInitials = (n: string) => {
    return n
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "S";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide a valid name.");
      return;
    }

    const incomeVal = Number(monthlyIncome);
    if (isNaN(incomeVal) || incomeVal < 0) {
      toast.error("Please enter a valid monthly allowance.");
      return;
    }

    setSaving(true);
    const newInitials = calculateInitials(name.trim());
    const updatedUser: DemoUser = {
      ...user,
      name: name.trim(),
      monthly_income: incomeVal,
      avatar: avatarUrl.trim() || undefined,
      initials: newInitials,
    };

    try {
      // 1. Update Supabase if authenticated
      const supabase = createClient();
      await supabase
        .from("users")
        .update({
          name: updatedUser.name,
          monthly_income: updatedUser.monthly_income,
          avatar: updatedUser.avatar,
        })
        .eq("id", user.id);
    } catch (err) {
      // Offline/demo fallback continues gracefully
    }

    // 2. Update client session & localStorage
    setClientDemoSession(updatedUser);
    onProfileUpdated(updatedUser);
    toast.success("Profile updated successfully!");
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-primary dark:text-teal-400" />
            Edit Student Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Update your personal info, avatar, and monthly budget for rent calculations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <Avatar className="h-14 w-14 border-2 border-white dark:border-slate-700 shadow-sm shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
              <AvatarFallback className="bg-primary text-white font-extrabold text-sm">
                {calculateInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Avatar Image URL (Optional)
              </label>
              <Input
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="text-xs h-8 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="bg-white dark:bg-slate-800"
              required
            />
          </div>

          {/* Email (Read-only verified student email) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Campus Email</span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Verified Domain</span>
            </label>
            <Input
              value={user.email}
              disabled
              className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed text-xs"
            />
          </div>

          {/* Monthly Allowance / Income */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Monthly Allowance / Income (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">
                ₹
              </span>
              <Input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="15000"
                className="pl-7 bg-white dark:bg-slate-800 font-semibold"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Used automatically by the Rent Health Engine to benchmark rent split affordability.
            </p>
          </div>

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
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
