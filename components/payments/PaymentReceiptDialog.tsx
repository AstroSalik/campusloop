"use client";

import React from "react";
import { 
  CheckCircle2, 
  Copy, 
  Download, 
  ExternalLink, 
  FileText, 
  MapPin, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  User, 
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
import { PaymentTransaction } from "@/lib/razorpay-service";

interface PaymentReceiptDialogProps {
  transaction: PaymentTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentReceiptDialog({
  transaction,
  open,
  onOpenChange,
}: PaymentReceiptDialogProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText?.(transaction.id);
    toast.success("Payment ID copied to clipboard!");
  };

  const formattedDate = new Date(transaction.created_at).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        {/* Receipt Header Banner */}
        <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
            <ShieldCheck className="w-28 h-28 text-white" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center text-teal-400 border border-teal-500/30">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                Campus<span className="text-teal-400">Loop</span> Pay
              </span>
            </div>
            <Badge variant="outline" className="bg-emerald-950/60 text-emerald-300 border-emerald-500/40 text-[10px] font-semibold tracking-wider uppercase">
              Razorpay Test Verified
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Official Transaction Receipt</p>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-extrabold text-white">
                ₹{transaction.amount.toLocaleString("en-IN")}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Paid Successfully
              </span>
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5 text-sm max-h-[60vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Key Reference Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Payment ID</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                  {transaction.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  title="Copy Payment ID"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Date & Time</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                {formattedDate}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Payment Method</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 capitalize flex items-center gap-1">
                {transaction.payment_method.toUpperCase()} 
                {transaction.payment_details?.card_last4 && `(••• ${transaction.payment_details.card_last4})`}
                {transaction.payment_details?.upi_id && `(${transaction.payment_details.upi_id})`}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Order Reference</span>
              <span className="font-mono text-xs text-slate-600 dark:text-slate-400 mt-0.5 block truncate">
                {transaction.order_id}
              </span>
            </div>
          </div>

          {/* Itemized Detail */}
          <div className="border-t border-b border-slate-100 dark:border-slate-800 py-3.5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Transaction Purpose & Details
            </h4>
            
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {transaction.item_title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {transaction.type_label}
                </p>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm shrink-0">
                ₹{transaction.amount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* If PG spot booked */}
            {transaction.booking_spot && (
              <div className="rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 p-2.5 flex items-center justify-between text-xs">
                <span className="text-teal-900 dark:text-teal-200 font-medium">
                  Confirmed Room Spot:
                </span>
                <Badge className="bg-teal-700 text-white font-bold">
                  Spot #{transaction.booking_spot}
                </Badge>
              </div>
            )}

            {/* If Marketplace item with pickup OTP */}
            {transaction.pickup_otp && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-amber-900 dark:text-amber-200 font-bold block">
                    Campus Handover Pickup OTP:
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    Share this 4-digit code with seller when taking delivery
                  </span>
                </div>
                <span className="font-mono text-base font-black tracking-widest px-2.5 py-1 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-md border border-amber-300 dark:border-amber-700">
                  {transaction.pickup_otp}
                </span>
              </div>
            )}
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Payer (Student)</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">{transaction.payer_name}</p>
              <p className="text-slate-500 dark:text-slate-400 truncate">{transaction.payer_email}</p>
            </div>

            {transaction.payee_name && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Payee / Recipient</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{transaction.payee_name}</p>
                <p className="text-slate-500 dark:text-slate-400 truncate">{transaction.payee_email || "Campus Student"}</p>
              </div>
            )}
          </div>

          {/* Verification Stamp & QR Mockup */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shadow-2xs">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 32 32" className="w-full h-full text-slate-900 dark:text-white" fill="currentColor">
                  <path d="M4 4h8v8H4zm2 2v4h4V6zm8-2h2v2h-2zm4 0h8v8h-8zm2 2v4h4V6zM4 20h8v8H4zm2 2v4h4v-4zm10-2h4v2h-4zm6 0h2v2h-2zm-2 2h2v2h-2zm4 0h2v4h-2zm-8 2h2v2h-2zm4 2h2v2h-2zm-6 2h4v2h-4zm10-2h2v4h-2zm4-2h2v2h-2zm-2 4h4v2h-4z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Digital Escrow Verified
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Protected by CampusLoop Peer Guarantee
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">TEST MODE</span>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex sm:justify-between items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-semibold gap-1.5 border-slate-300 dark:border-slate-700"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save PDF
          </Button>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
