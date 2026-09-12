"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Upload, 
  X, 
  AlertCircle
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
import { Badge } from "@/components/ui/badge";
import { DemoUser, setClientDemoSession } from "@/lib/auth";
import { 
  formatAadhaarInput, 
  validateAadhaarVerhoeff 
} from "@/lib/kyc-validator";

interface KycVerificationDialogProps {
  user: DemoUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: (updated: DemoUser) => void;
}

export function KycVerificationDialog({
  user,
  open,
  onOpenChange,
  onVerified,
}: KycVerificationDialogProps) {
  const [step, setStep] = useState<"details" | "otp" | "success">("details");
  const [aadhaarRaw, setAadhaarRaw] = useState("");
  const [fullName, setFullName] = useState(user.name || "");
  const [consent, setConsent] = useState(false);
  const [docFront, setDocFront] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanAadhaar = aadhaarRaw.replace(/\s+/g, "");
  const isAadhaar12 = cleanAadhaar.length === 12;
  const isVerhoeffValid = isAadhaar12 && validateAadhaarVerhoeff(cleanAadhaar);

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhaarInput(e.target.value);
    setAadhaarRaw(formatted);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Please upload a valid image (PNG, JPG, WEBP) or PDF of your Aadhaar card.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Document size is too large (max 8MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDocFront(reader.result as string);
      toast.success("Aadhaar document uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAadhaar12) {
      toast.error("Please enter a complete 12-digit Aadhaar number.");
      return;
    }

    if (!isVerhoeffValid) {
      toast.error("The 12-digit Aadhaar number is invalid according to official UIDAI checksum. Please double-check.");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Please provide your name as printed on your Aadhaar card.");
      return;
    }

    if (!docFront) {
      toast.error("Please upload a clear scan or photo of your Aadhaar card.");
      return;
    }

    if (!consent) {
      toast.error("Please check the consent box to proceed with KYC verification.");
      return;
    }

    setStep("otp");
    toast.info("Please enter your verification OTP to continue.");
  };

  const handleFinalVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit OTP to continue.");
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch("/api/kyc/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaar_number: cleanAadhaar,
          aadhaar_name: fullName.trim(),
          doc_front_image: docFront,
          consent_agreed: consent,
          otp_code: otpCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Aadhaar verification failed. Please check details.");
        setVerifying(false);
        return;
      }

      const updatedUser: DemoUser = {
        ...user,
        verification_status: "pending",
        aadhaar_last4: cleanAadhaar.slice(-4),
        kyc_doc_type: "Aadhaar Card (Under Review)",
        kyc_submitted_at: new Date().toISOString(),
      };

      setClientDemoSession(updatedUser);
      onVerified(updatedUser);
      setStep("success");
      toast.success("Aadhaar KYC submitted! Documents are now under review.");
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred during KYC verification.");
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("details");
      setOtpCode("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 dark:bg-teal-400/20 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                Student Aadhaar KYC Verification
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Official UIDAI Aadhaar verification to unlock your Verified Student tag.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === "details" && (
          <form onSubmit={handleProceedToOtp} className="space-y-4 pt-1">
            <div className="rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/60 p-3 text-xs text-teal-900 dark:text-teal-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-teal-800 dark:text-teal-300">
                <Lock className="h-3.5 w-3.5" />
                <span>Bank-Grade Privacy & Encryption</span>
              </div>
              <p className="text-[11px] leading-relaxed text-teal-700/90 dark:text-teal-300/80">
                Aadhaar details and document scans are transmitted securely to the server for verification, where only the masked last 4 digits are retained in the public profile after review.
              </p>
            </div>

            {/* Aadhaar Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  12-Digit Aadhaar Number *
                </label>
                {cleanAadhaar.length > 0 && (
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                    isVerhoeffValid 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : cleanAadhaar.length === 12 
                        ? "text-red-500" 
                        : "text-slate-400"
                  }`}>
                    {isVerhoeffValid ? (
                      <>
                        <Check className="h-3 w-3" /> Valid UIDAI Format
                      </>
                    ) : cleanAadhaar.length === 12 ? (
                      <>
                        <AlertCircle className="h-3 w-3" /> Checksum Mismatch
                      </>
                    ) : (
                      `${cleanAadhaar.length} / 12 digits`
                    )}
                  </span>
                )}
              </div>
              <Input
                type="text"
                placeholder="XXXX XXXX XXXX"
                value={aadhaarRaw}
                onChange={handleAadhaarChange}
                maxLength={14}
                required
                className="h-10 text-sm font-mono tracking-wider bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Full Name on Aadhaar */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name (As on Aadhaar Card) *
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Bilal Ashiq"
                required
                className="h-10 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Document Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Aadhaar Card Document / Scan *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${
                  docFront 
                    ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-800" 
                    : "border-slate-200 dark:border-slate-700 hover:border-primary/50 bg-slate-50/50 dark:bg-slate-800/40"
                }`}
              >
                {docFront ? (
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Aadhaar Photo Attached (Click to change)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="h-5 w-5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Upload Aadhaar Card (Front Side)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PNG, JPG, or PDF up to 8MB
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* UIDAI Consent Checkbox */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <input
                id="aadhaar-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer shrink-0"
              />
              <label
                htmlFor="aadhaar-consent"
                className="text-[11px] leading-tight text-slate-600 dark:text-slate-300 cursor-pointer select-none"
              >
                I voluntarily submit my Aadhaar details for student identity verification on CampusLoop and confirm that this information is accurate.
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!isVerhoeffValid || !docFront || !consent}
                className="bg-primary hover:bg-primary/90 text-white text-xs font-bold gap-1.5"
              >
                <span>Continue to OTP</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleFinalVerify} className="space-y-4 pt-1">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 space-y-2 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-teal-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Enter 6-Digit Aadhaar Verification OTP
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Sent to mobile linked with Aadhaar ending in <strong className="text-slate-800 dark:text-slate-200">•••• {cleanAadhaar.slice(-4)}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center block">
                Verification OTP
              </label>
              <Input
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                autoFocus
                required
                className="h-12 text-center text-lg font-mono tracking-widest bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("details")}
                disabled={verifying}
                className="text-xs"
              >
                Back
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={verifying || otpCode.length !== 6}
                className="bg-primary hover:bg-primary/90 text-white text-xs font-bold flex-1"
              >
                {verifying ? "Verifying with UIDAI..." : "Complete Verification"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "success" && (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 ring-8 ring-amber-50 dark:ring-amber-900/30 animate-in zoom-in-50">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Aadhaar KYC Submitted!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Your Aadhaar verification has been submitted securely. Your profile is currently under review and will display the <strong className="text-emerald-600 dark:text-emerald-400">Verified Student</strong> badge once approved.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              KYC In Review • Aadhaar ending in •••• {cleanAadhaar.slice(-4)}
            </div>

            <div className="pt-2">
              <Button
                type="button"
                onClick={handleClose}
                className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold h-10"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
