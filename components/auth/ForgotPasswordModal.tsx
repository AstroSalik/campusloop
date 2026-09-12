"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Lock, 
  Mail, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  X 
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  onSuccess?: () => void;
}

type ResetStep = "email" | "otp" | "password" | "done";

export function ForgotPasswordModal({
  open,
  onOpenChange,
  defaultEmail = "",
  onSuccess,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState(defaultEmail);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep("email");
      if (defaultEmail) setEmail(defaultEmail);
      setOtpCode("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setDemoCodeNotice(null);
    }
  }, [open, defaultEmail]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Step 1: Request 6-digit OTP Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid student or campus email address.");
      return;
    }

    setLoading(true);
    setDemoCodeNotice(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to dispatch verification code.");
        return;
      }

      setMaskedEmail(data.maskedEmail || cleanEmail);
      if (data.code) {
        setDemoCodeNotice(data.code);
      }
      setResendTimer(60);
      setStep("otp");
      toast.success(data.message || "Verification code dispatched!");
    } catch (err: any) {
      toast.error(err?.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: cleanCode }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "Verification failed. Please re-check code.");
        return;
      }

      setResetToken(data.resetToken);
      setStep("password");
      toast.success("Code verified! Please create your new secure password.");
    } catch (err: any) {
      toast.error(err?.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

    if (!hasLetter || !hasNumberOrSymbol) {
      toast.error("Password must contain both letters and numbers/symbols.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to reset password.");
        return;
      }

      setStep("done");
      toast.success("Password reset successfully!");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-primary/95 to-teal-700 dark:from-primary/90 dark:to-teal-900 text-white p-5 space-y-1 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white shadow-xs backdrop-blur-xs">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white tracking-tight">
                {step === "email" && "Reset Student Password"}
                {step === "otp" && "Enter Verification Code"}
                {step === "password" && "Set New Password"}
                {step === "done" && "Password Reset Complete"}
              </DialogTitle>
              <DialogDescription className="text-xs text-teal-100 dark:text-teal-200">
                {step === "email" && "We'll send a secure one-time code to verify your campus identity."}
                {step === "otp" && `Verification code sent to ${maskedEmail || email}`}
                {step === "password" && "Create a new strong password for your CampusLoop account."}
                {step === "done" && "You can now sign in with your updated credentials."}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {/* STEP 1: Enter Email */}
          {step === "email" && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="student@campus.edu or your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 h-10 text-xs border-slate-200 dark:border-slate-700"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Enter the email address you registered with when creating your CampusLoop account.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs text-slate-500"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-xs px-5"
                >
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Enter 6-digit OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {demoCodeNotice && (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-800 dark:text-teal-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Security Verification Code Dispatched</span>
                  </div>
                  <p className="text-[11px] text-teal-700 dark:text-teal-300">
                    Use code: <strong className="font-mono text-sm tracking-widest text-primary dark:text-teal-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border">{demoCodeNotice}</strong>
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>6-Digit Verification Code</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Expires in 10 minutes
                  </span>
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  className="h-11 text-center font-mono text-xl tracking-[0.4em] font-bold border-slate-200 dark:border-slate-700"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500">
                  This prevents anyone else from modifying your credentials without your permission.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Change email
                </button>

                {resendTimer > 0 ? (
                  <span className="text-slate-400 text-[11px]">
                    Resend code in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestCode}
                    className="text-primary dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Resend code
                  </button>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-xs"
                >
                  {loading ? "Verifying Code..." : "Verify & Proceed"}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters with letters & numbers"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pl-9 pr-9 h-10 text-xs border-slate-200 dark:border-slate-700"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-9 pr-9 h-10 text-xs border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-xs mt-2"
              >
                {loading ? "Updating Password..." : "Save New Password"}
              </Button>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === "done" && (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Password Reset Successful!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Your password has been updated and securely synchronized across your student account.
                </p>
              </div>

              <Button
                onClick={() => onOpenChange(false)}
                className="w-full h-10 font-bold bg-primary hover:bg-primary/90 text-white shadow-xs"
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
