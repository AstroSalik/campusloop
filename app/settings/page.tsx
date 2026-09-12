"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  AlertTriangle, 
  ArrowLeft, 
  Bell, 
  Check, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Laptop, 
  Lock, 
  LogOut, 
  Moon, 
  Phone, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  Smartphone, 
  Sun, 
  Trash2, 
  UserCheck, 
  UserX, 
  Users, 
  Volume2, 
  Wallet 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { getClientDemoSession, clearClientDemoSession, DemoUser } from "@/lib/auth";
import { fetchUserBlocks, unblockUser } from "@/lib/blocks";
import { AuthRequiredGuard } from "@/components/auth/AuthRequiredGuard";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { useTheme } from "@/lib/useTheme";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(() => getClientDemoSession());
  const [loading, setLoading] = useState(false);

  // Password Change Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  // Account Deletion States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePasswordConfirmation, setDeletePasswordConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Privacy & Preferences States
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [chatSound, setChatSound] = useState(true);
  const [hidePhoneNumber, setHidePhoneNumber] = useState(false);
  const [showMonthlyBudget, setShowMonthlyBudget] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Blocked Students List
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);

  useEffect(() => {
    const handleAuth = () => {
      setCurrentUser(getClientDemoSession());
    };
    window.addEventListener("campusloop_auth_changed", handleAuth);
    return () => window.removeEventListener("campusloop_auth_changed", handleAuth);
  }, []);

  // Load User Preferences & Blocked Users
  useEffect(() => {
    if (!currentUser) return;

    // Load blocked users
    const loadBlocks = async () => {
      try {
        const blocksData = await fetchUserBlocks(currentUser.id);
        setBlockedUsers(blocksData.blockedUserIds || []);
      } catch {
        // ignore
      } finally {
        setLoadingBlocks(false);
      }
    };
    loadBlocks();

    // Load settings from server
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/auth/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            if (data.settings.email_notifications !== undefined) {
              setEmailNotifications(data.settings.email_notifications);
            }
            if (data.settings.chat_sound !== undefined) {
              setChatSound(data.settings.chat_sound);
            }
            if (data.settings.hide_phone_number !== undefined) {
              setHidePhoneNumber(data.settings.hide_phone_number);
            }
            if (data.settings.show_monthly_budget !== undefined) {
              setShowMonthlyBudget(data.settings.show_monthly_budget);
            }
          }
        }
      } catch {}
    };
    loadSettings();
  }, [currentUser]);

  // Handle Save Preferences
  const handleSavePreferences = async (updated: {
    email_notifications?: boolean;
    chat_sound?: boolean;
    hide_phone_number?: boolean;
    show_monthly_budget?: boolean;
  }) => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/auth/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: updated }),
      });
      if (res.ok) {
        toast.success("Settings saved successfully.");
      } else {
        toast.error("Could not update settings.");
      }
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password to verify your identity.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

    if (!hasLetter || !hasNumberOrSymbol) {
      toast.error("New password must contain both letters and at least one number or symbol.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match. Please re-enter.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to update password. Please check your current password.");
        return;
      }

      toast.success("Password changed successfully! Your account is secure.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred while changing password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Unblock Student
  const handleUnblock = async (blockedId: string) => {
    if (!currentUser) return;
    try {
      const success = await unblockUser(currentUser.id, blockedId);
      if (success) {
        setBlockedUsers((prev) => prev.filter((id) => id !== blockedId));
        toast.success("Student unblocked. You can now chat and message each other.");
      } else {
        toast.error("Could not unblock student. Please try again.");
      }
    } catch {
      toast.error("Failed to unblock student.");
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (!deletePasswordConfirmation) {
      toast.error("Please enter your password to authorize permanent account deletion.");
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordConfirmation: deletePasswordConfirmation,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "Account deletion failed. Incorrect password.");
        return;
      }

      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {}

      clearClientDemoSession();
      toast.success("Your CampusLoop account and all associated data have been permanently deleted.");
      setIsDeleteDialogOpen(false);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred while deleting account.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!currentUser) {
    return (
      <AuthRequiredGuard
        title="Sign In to Access Settings"
        featureName="Account & Security Settings"
        description="To manage your password, privacy settings, active sessions, and notification preferences, please sign in with your student account."
        redirectUrl="/settings"
        backUrl="/"
        backLabel="Back to Home"
      />
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Account Settings
            </h1>
            <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
              Verified Student
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your credentials, privacy preferences, blocked users, and campus security.
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="self-start sm:self-auto text-xs font-semibold gap-1.5">
          <Link href="/profile">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Profile
          </Link>
        </Button>
      </div>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="security" className="w-full space-y-6">
        <TabsList className="grid grid-cols-4 w-full bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <TabsTrigger value="security" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary dark:data-[state=active]:text-teal-300 text-slate-600 dark:text-slate-400">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Security & Password</span>
            <span className="sm:hidden">Security</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary dark:data-[state=active]:text-teal-300 text-slate-600 dark:text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Privacy & Safety</span>
            <span className="sm:hidden">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary dark:data-[state=active]:text-teal-300 text-slate-600 dark:text-slate-400">
            <Bell className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Preferences</span>
            <span className="sm:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-slate-600 dark:text-slate-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Danger Zone</span>
            <span className="sm:hidden">Danger</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SECURITY & PASSWORD */}
        <TabsContent value="security" className="space-y-6">
          {/* Change Password Card */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-primary dark:text-teal-400 mb-1">
                <KeyRound className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Authentication Security</span>
              </div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Change Account Password
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                To protect your student account, you must enter your current password before choosing a new one.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                {/* Current Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Current Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordModalOpen(true)}
                      className="text-[11px] font-semibold text-primary hover:underline dark:text-teal-400"
                    >
                      Forgot current password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="pl-9 pr-9 h-10 text-xs border-slate-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>New Password *</span>
                    <span className="text-[10px] text-slate-500 font-normal">Min. 8 chars (letters & numbers)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Min. 8 chars with letters & numbers"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pl-9 pr-9 h-10 text-xs border-slate-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type={showConfirmNewPassword ? "text" : "password"}
                      placeholder="Re-enter your new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      className="pl-9 pr-9 h-10 text-xs border-slate-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-xs px-5"
                  >
                    {isChangingPassword ? "Verifying & Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Active Session Card */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Laptop className="h-4 w-4 text-slate-500" />
                Active Campus Session
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                You are currently signed in on this device with TLS 1.3 encryption and Supabase Row Level Security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {currentUser.name} ({currentUser.email})
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Campus: {currentUser.campus_name || "Lovely Professional University (LPU)"}
                    </span>
                  </div>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Active Now
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PRIVACY & SAFETY */}
        <TabsContent value="privacy" className="space-y-6">
          {/* Privacy Toggles */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Profile & Campus Privacy
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Control what personal details fellow campus students can view.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Hide Phone Number
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    When enabled, your phone number will be hidden and students must message you through CampusLoop chat.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={hidePhoneNumber}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setHidePhoneNumber(val);
                    handleSavePreferences({ hide_phone_number: val });
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-primary accent-primary cursor-pointer shrink-0"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Display Monthly Budget on Roommate Finder
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Helps potential roommates with matching budgets find and connect with you.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={showMonthlyBudget}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setShowMonthlyBudget(val);
                    handleSavePreferences({ show_monthly_budget: val });
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-primary accent-primary cursor-pointer shrink-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Blocked Users Management */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserX className="h-4 w-4 text-slate-500" />
                    Blocked Students ({blockedUsers.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Blocked students cannot message you or initiate chats with you across the campus network.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingBlocks ? (
                <div className="py-6 text-center text-xs text-slate-400">Loading blocked list...</div>
              ) : blockedUsers.length === 0 ? (
                <div className="py-8 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-800/30">
                  <UserCheck className="mx-auto h-7 w-7 text-slate-400" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    No blocked students
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    You have not blocked any campus peers. You can block any user directly from their chat window.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {blockedUsers.map((blockedId) => (
                    <div
                      key={blockedId}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs">
                          <UserX className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            Student ID: {blockedId.substring(0, 8)}...
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Blocked from messaging
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblock(blockedId)}
                        className="h-8 text-xs font-semibold text-primary dark:text-teal-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: NOTIFICATIONS & PREFERENCES */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Notification Alerts
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Choose when you want to receive alerts for marketplace and chat interactions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Marketplace & Restock Email Notifications
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Receive email alerts whenever an item you posted sells out or a student requests a restock.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setEmailNotifications(val);
                    handleSavePreferences({ email_notifications: val });
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-primary accent-primary cursor-pointer shrink-0"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    In-App Sound & Chat Tone
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Play a gentle chime when receiving new peer messages while browsing CampusLoop.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={chatSound}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setChatSound(val);
                    handleSavePreferences({ chat_sound: val });
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-primary accent-primary cursor-pointer shrink-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Appearance Selector */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Color Theme & Mode
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Switch between clean light mode and sleek dark theme.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    theme === "light"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Light Mode
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    theme === "dark"
                      ? "border-primary bg-primary/10 text-teal-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Dark Mode
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: DANGER ZONE (ACCOUNT DELETION) */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle className="text-base font-bold">
                  Delete CampusLoop Account
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-red-800 dark:text-red-300/80 leading-relaxed">
                Once you delete your account, there is no going back. All of your items, accommodation listings, roommate posts, chats, and payment records will be permanently removed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <p>
                Before proceeding, please note:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li>All your active marketplace items and images will be purged.</li>
                <li>Your student KYC and verified badges will be deleted.</li>
                <li>Active chats with buyers and roommates will be cleared.</li>
                <li>You will immediately be signed out from all campus devices.</li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2 border-t border-red-200/60 dark:border-red-900/40 flex justify-end">
              <Button
                variant="destructive"
                onClick={() => {
                  setDeletePasswordConfirmation("");
                  setIsDeleteDialogOpen(true);
                }}
                className="font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete My Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Deletion Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Confirm Permanent Account Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Please enter your password to authorize the permanent deletion of your student account ({currentUser.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-200">
              <strong>Warning:</strong> This action cannot be reversed. All your campus data will be purged.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Enter Password to Confirm
              </label>
              <Input
                type="password"
                placeholder="Your password"
                value={deletePasswordConfirmation}
                onChange={(e) => setDeletePasswordConfirmation(e.target.value)}
                className="h-10 text-xs border-slate-200 dark:border-slate-700"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeletingAccount || !deletePasswordConfirmation}
              onClick={handleDeleteAccount}
              className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isDeletingAccount ? "Purging Account..." : "Permanently Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal (for logged in users who forgot current password) */}
      <ForgotPasswordModal
        open={isForgotPasswordModalOpen}
        onOpenChange={setIsForgotPasswordModalOpen}
        defaultEmail={currentUser.email}
      />
    </div>
  );
}
