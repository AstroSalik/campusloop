"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { 
  Camera, 
  Check, 
  Edit3, 
  Link as LinkIcon, 
  Trash2, 
  Upload, 
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DemoUser, setClientDemoSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

interface EditProfileDialogProps {
  user: DemoUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated: (updated: DemoUser) => void;
}

// Client-side lightweight image compression for snappy avatar storage & rendering
async function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDim = 400;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const [name, setName] = useState(user.name || "");
  const [monthlyIncome, setMonthlyIncome] = useState(user.monthly_income ? String(user.monthly_income) : "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(user.name || "");
      setMonthlyIncome(user.monthly_income ? String(user.monthly_income) : "");
      setAvatarUrl(user.avatar || "");
      setShowUrlInput(false);
    }
  }, [open, user]);

  const calculateInitials = (n: string) => {
    if (!n || !n.trim()) return "S";
    return n
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "S";
  };

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file is too large (max 8MB).");
      return;
    }

    setProcessingImage(true);
    try {
      const compressedDataUrl = await processImageFile(file);
      setAvatarUrl(compressedDataUrl);
      toast.success("Profile photo selected from device!");
    } catch (err) {
      toast.error("Could not process selected image. Please try another.");
    } finally {
      setProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Avatar removed. Initials will be used.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide your full name.");
      return;
    }

    let incomeVal: number | undefined = undefined;
    if (monthlyIncome.trim()) {
      const parsedNum = Number(monthlyIncome);
      if (isNaN(parsedNum) || parsedNum < 0) {
        toast.error("Please enter a valid monthly allowance.");
        return;
      }
      incomeVal = parsedNum;
    }

    setSaving(true);
    const newInitials = calculateInitials(name.trim());
    const finalAvatar = avatarUrl.trim() || undefined;

    const updatedUser: DemoUser = {
      ...user,
      name: name.trim(),
      monthly_income: incomeVal,
      avatar: finalAvatar,
      initials: newInitials,
    };

    try {
      // 1. Update Supabase users table
      const supabase = createClient();
      const { error } = await supabase
        .from("users")
        .update({
          name: updatedUser.name,
          monthly_income: updatedUser.monthly_income != null ? updatedUser.monthly_income : null,
          avatar: updatedUser.avatar || null,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Supabase profile update warning:", error);
      }
    } catch (err) {
      console.error("Profile update exception:", err);
    }

    // 2. Update client session & broadcast to listeners (ProfilePage, Navbar, Dashboard)
    setClientDemoSession(updatedUser);
    onProfileUpdated(updatedUser);
    toast.success("Profile and avatar updated successfully!");
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
            Update your profile details, avatar photo, and monthly budget for rent calculations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Avatar Preview & Device Upload Options */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="relative group shrink-0">
              <Avatar className="h-16 w-16 border-2 border-white dark:border-slate-700 shadow-md">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name || "Avatar"}
                    className="aspect-square h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <AvatarFallback className="bg-primary text-white font-extrabold text-lg">
                    {calculateInitials(name)}
                  </AvatarFallback>
                )}
              </Avatar>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={processingImage}
                title="Change Photo"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-1.5 min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Profile Photo
              </span>

              {/* Hidden device file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleDeviceUpload}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processingImage}
                  className="h-8 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <Upload className="h-3.5 w-3.5 text-primary dark:text-teal-400" />
                  {processingImage ? "Processing..." : "Upload from Device"}
                </Button>

                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    className="h-8 text-xs text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>

              {!showUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-teal-300 underline underline-offset-2 block pt-0.5"
                >
                  Or paste an image web link
                </button>
              ) : (
                <div className="relative pt-1">
                  <LinkIcon className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="text-xs h-8 pl-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}
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
              placeholder={user.name || "Enter your full name"}
              className="bg-white dark:bg-slate-800 font-medium"
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
              Monthly Allowance / Income (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">
                ₹
              </span>
              <Input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="e.g. 15000"
                className="pl-7 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Used by the Rent Health Engine on the dashboard and room listings to benchmark affordability.
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
