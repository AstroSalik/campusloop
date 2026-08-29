"use client";

import React, { useState } from "react";
import { 
  AlertCircle, 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  HelpCircle, 
  Info, 
  Lock, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  X 
} from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { refundTransactionForBooking } from "@/lib/razorpay-service";
import { cancelRoomBooking } from "@/lib/housing-data";

interface CancelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  roomTitle: string;
  spotNumber: number;
  userId: string;
  userName: string;
  depositAmount?: number;
  onCancelled: () => void;
}

const CANCEL_REASONS = [
  "Found alternative accommodation closer to campus",
  "Changes in monthly budget / financial plan",
  "Academic schedule / semester relocation change",
  "Roommate / flat preferences mismatch",
  "Personal or family reasons",
];

export function CancelBookingDialog({
  open,
  onOpenChange,
  roomId,
  roomTitle,
  spotNumber,
  userId,
  userName,
  depositAmount = 1000,
  onCancelled,
}: CancelBookingDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [customNote, setCustomNote] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<"form" | "processing">("form");

  const handleConfirmCancel = async () => {
    if (!acknowledged) {
      toast.error("Please confirm that you understand your spot will be released.");
      return;
    }

    setProcessing(true);
    setStep("processing");

    // Simulate realistic refund processing delay via Razorpay test gateway
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // 1. Cancel room spot in housing data
    const res = cancelRoomBooking(roomId, userId);

    // 2. Mark transaction as refunded in payment ledger
    refundTransactionForBooking(
      roomId,
      userId,
      `${selectedReason}${customNote ? ` - Note: ${customNote}` : ""}`
    );

    setProcessing(false);
    setStep("form");
    onOpenChange(false);

    if (res.success) {
      toast.success(
        `Booking cancelled. Razorpay test refund of ₹${depositAmount.toLocaleString("en-IN")} has been initiated to your account.`
      );
      onCancelled();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
            <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-950/60 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Cancel Accommodation Booking
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Please review the cancellation terms and refund details before releasing your allocated spot.
          </DialogDescription>
        </DialogHeader>

        {step === "processing" ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-red-600 animate-spin" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Processing Cancellation & Razorpay Refund...
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Releasing Spot #{spotNumber} and initiating test mode refund of ₹{depositAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Booking Summary Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Current Reservation
                </span>
                <Badge variant="outline" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-[10px] font-bold">
                  Spot #{spotNumber}
                </Badge>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{roomTitle}</p>
              <div className="flex justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Refundable Amount:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{depositAmount.toLocaleString("en-IN")} (100% Refund)
                </span>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Why are you cancelling this booking?
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {CANCEL_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedReason(r)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                      selectedReason === r
                        ? "bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 font-semibold"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <span>{r}</span>
                    {selectedReason === r && (
                      <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Note */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Additional Note for Host (Optional)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Relocating to South campus"
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>

            {/* Irreversible Warning & Checkbox */}
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-tight">
                  Once cancelled, Spot #{spotNumber} will be reopened immediately to other students. Razorpay test refund will be posted to your transactions ledger.
                </p>
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="rounded mt-0.5 border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  I understand this cancellation is irreversible.
                </span>
              </label>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={processing}
            className="border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            Keep My Spot
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={handleConfirmCancel}
            disabled={!acknowledged || processing}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Confirm Cancellation & Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
