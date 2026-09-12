"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { 
  Building2,
  Camera, 
  Check, 
  Edit3, 
  GraduationCap,
  Link as LinkIcon, 
  Phone,
  ShieldAlert,
  ShieldCheck,
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
import { Badge } from "@/components/ui/badge";
import { DemoUser, setClientDemoSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { MAJOR_CAMPUSES, STUDY_YEAR_OPTIONS, POPULAR_DEPARTMENTS } from "@/lib/campuses";

interface EditProfileDialogProps {
  user: DemoUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated: (updated: DemoUser) => void;
  onRequestKyc?: () => void;
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
  onRequestKyc,
}: EditProfileDialogProps) {
  const [name, setName] = useState(user.name || "");
  const [campusName, setCampusName] = useState(user.campus_name || "Lovely Professional University (LPU)");
  const [isCustomCampus, setIsCustomCampus] = useState(false);
  const [city, setCity] = useState(user.city || "Phagwara, Punjab");
  const [department, setDepartment] = useState(user.department || "Computer Science & Engineering (CSE)");
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [yearOfStudy, setYearOfStudy] = useState(user.year_of_study || STUDY_YEAR_OPTIONS[3]);
  const [phone, setPhone] = useState(user.phone || "");
  const [monthlyIncome, setMonthlyIncome] = useState(user.monthly_income ? String(user.monthly_income) : "15000");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(user.name || "");
      const existingCampus = user.campus_name || "Lovely Professional University (LPU)";
      setCampusName(existingCampus);
      const matchedCampus = MAJOR_CAMPUSES.find((c) => c.name === existingCampus);
      setIsCustomCampus(!matchedCampus);

      setCity(user.city || matchedCampus ? `${matchedCampus?.city}, ${matchedCampus?.state}` : "");
      
      const existingDept = user.department || "Computer Science & Engineering (CSE)";
      setDepartment(existingDept);
      setIsCustomDept(!POPULAR_DEPARTMENTS.includes(existingDept));

      setYearOfStudy(user.year_of_study || STUDY_YEAR_OPTIONS[3]);
      setPhone(user.phone || "");
      setMonthlyIncome(user.monthly_income != null ? String(user.monthly_income) : "15000");
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

  const handleCampusSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "OTHER") {
      setIsCustomCampus(true);
      setCampusName("");
    } else {
      setIsCustomCampus(false);
      const found = MAJOR_CAMPUSES.find((c) => c.id === val);
      if (found) {
        setCampusName(found.name);
        setCity(`${found.city}, ${found.state}`);
      }
    }
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

    if (!campusName.trim()) {
      toast.error("Please provide your college or university campus.");
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
      campus_name: campusName.trim(),
      city: city.trim(),
      department: department.trim(),
      year_of_study: yearOfStudy.trim(),
      phone: phone.trim(),
      monthly_income: incomeVal,
      avatar: finalAvatar,
      initials: newInitials,
    };

    try {
      // 1. Sync through authenticated server route
      await fetch("/api/auth/sync-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedUser.name,
          campus_name: updatedUser.campus_name,
          city: updatedUser.city,
          department: updatedUser.department,
          year_of_study: updatedUser.year_of_study,
          phone: updatedUser.phone,
          monthly_income: updatedUser.monthly_income,
          avatar: updatedUser.avatar || null,
        }),
      });

      // 2. Also update Supabase client session metadata & users table directly
      const supabase = createClient();
      await supabase.auth.updateUser({
        data: {
          full_name: updatedUser.name,
          name: updatedUser.name,
          campus_name: updatedUser.campus_name,
          city: updatedUser.city,
          department: updatedUser.department,
          year_of_study: updatedUser.year_of_study,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
        },
      });

      try {
        await supabase
          .from("users")
          .update({
            name: updatedUser.name,
            campus_name: updatedUser.campus_name,
            city: updatedUser.city,
            department: updatedUser.department,
            year_of_study: updatedUser.year_of_study,
            phone: updatedUser.phone,
            monthly_income: updatedUser.monthly_income != null ? updatedUser.monthly_income : null,
            avatar: updatedUser.avatar || null,
          })
          .eq("id", user.id);
      } catch (e) {}
    } catch (err) {
      console.warn("Profile update warning:", err);
    }

    // 3. Update client session & broadcast to listeners (ProfilePage, Navbar, Dashboard)
    setClientDemoSession(updatedUser);
    onProfileUpdated(updatedUser);
    toast.success("Profile and campus updated successfully!");
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-primary dark:text-teal-400" />
            Edit Student Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Update your verified student details, actual campus, department, and contact information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Avatar Preview & Device Upload Options */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="relative group shrink-0">
              <Avatar className="h-16 w-16 min-w-[64px] max-w-[64px] min-h-[64px] max-h-[64px] border-2 border-white dark:border-slate-700 shadow-md shrink-0 rounded-full overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name || "Avatar"}
                    width={64}
                    height={64}
                    className="aspect-square w-full h-full max-w-full max-h-full object-cover rounded-full select-none block"
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

          {/* KYC Status Indicator in Edit Dialog */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {user.verification_status === "verified" ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="h-4 w-4" />
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {user.verification_status === "verified" ? "Aadhaar KYC Verified" : "Identity KYC Unverified"}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {user.verification_status === "verified"
                    ? `Aadhaar ending in •••• ${user.aadhaar_last4 || "XXXX"}`
                    : "Verify your Aadhaar card to receive the Verified Student tag"}
                </span>
              </div>
            </div>

            {user.verification_status !== "verified" && onRequestKyc && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onRequestKyc();
                }}
                className="h-7 text-xs font-bold border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                Verify KYC
              </Button>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Full Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bilal Ashiq"
              className="bg-white dark:bg-slate-800 font-medium"
              required
            />
          </div>

          {/* University / Campus Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Campus / University *</span>
              <span className="text-[10px] text-primary dark:text-teal-400 font-semibold">Your Actual Campus</span>
            </label>
            <select
              value={isCustomCampus ? "OTHER" : MAJOR_CAMPUSES.find((c) => c.name === campusName)?.id || "OTHER"}
              onChange={handleCampusSelectChange}
              className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100"
            >
              {MAJOR_CAMPUSES.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.name} ({camp.city})
                </option>
              ))}
              <option value="OTHER">Other / Custom University or College...</option>
            </select>
          </div>

          {/* If Custom Campus */}
          {isCustomCampus && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Custom University / College Name *
              </label>
              <Input
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                placeholder="Enter your college or university name"
                required
                className="bg-white dark:bg-slate-800 text-xs font-medium"
              />
            </div>
          )}

          {/* Campus City / State */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Campus City & State *
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Phagwara, Punjab"
              required
              className="bg-white dark:bg-slate-800 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Department / Program */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Department / Course
              </label>
              <select
                value={isCustomDept ? "OTHER" : department}
                onChange={(e) => {
                  if (e.target.value === "OTHER") {
                    setIsCustomDept(true);
                    setDepartment("");
                  } else {
                    setIsCustomDept(false);
                    setDepartment(e.target.value);
                  }
                }}
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100"
              >
                {POPULAR_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="OTHER">Other Department / Program...</option>
              </select>
              {isCustomDept && (
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. B.Tech Artificial Intelligence"
                  className="mt-1 h-9 text-xs bg-white dark:bg-slate-800"
                />
              )}
            </div>

            {/* Year of Study */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Year of Study / Batch
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100"
              >
                {STUDY_YEAR_OPTIONS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone / WhatsApp Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Phone / WhatsApp Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="pl-9 bg-white dark:bg-slate-800 text-xs font-medium"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Shared with confirmed roommate matches and item buyers for easy campus meetups.
            </p>
          </div>

          {/* Monthly Allowance / Income */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Monthly Allowance / Budget (₹ INR)
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
            <p className="text-[10px] text-slate-400">
              Used by the Rent Health Engine to benchmark housing affordability.
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
              className="bg-primary hover:bg-primary/90 text-white text-xs font-bold"
            >
              {saving ? "Saving Changes..." : "Save Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
