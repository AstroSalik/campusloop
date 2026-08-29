"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  CreditCard, 
  Lock, 
  QrCode, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  Wallet, 
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PaymentTransaction, 
  recordPaymentTransaction, 
  generatePickupOtp, 
  getRazorpayKeyId 
} from "@/lib/razorpay-service";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";

interface RazorpayCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  title: string;
  description: string;
  type: "housing_booking" | "marketplace_purchase" | "rent_split";
  typeLabel?: string;
  itemId: string;
  payeeId?: string;
  payeeName?: string;
  payeeEmail?: string;
  bookingSpot?: number;
  notes?: Record<string, string>;
  onSuccess: (transaction: PaymentTransaction) => void;
  onFailure?: (error: string) => void;
}

export function RazorpayCheckoutModal({
  open,
  onOpenChange,
  amount,
  title,
  description,
  type,
  typeLabel,
  itemId,
  payeeId,
  payeeName,
  payeeEmail,
  bookingSpot,
  notes = {},
  onSuccess,
  onFailure,
}: RazorpayCheckoutModalProps) {
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;

  const [activeTab, setActiveTab] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("student@oksbi");
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"checkout" | "authenticating" | "completed">("checkout");

  useEffect(() => {
    if (open) {
      setStep("checkout");
      setIsProcessing(false);
    }
  }, [open]);

  const handleSimulatedPayment = async (method: "upi" | "card" | "netbanking", simulateFailure = false) => {
    setIsProcessing(true);
    setStep("authenticating");

    // Simulate standard Razorpay 3D Secure / UPI intent gateway round-trip latency
    await new Promise((resolve) => setTimeout(resolve, 1400));

    if (simulateFailure || upiId.includes("failure")) {
      setIsProcessing(false);
      setStep("checkout");
      toast.error("Payment failed: Simulated transaction declined by issuing bank.");
      onFailure?.("Transaction declined");
      return;
    }

    // Prepare payment details
    let paymentDetails: PaymentTransaction["payment_details"] = {};
    if (method === "upi") {
      paymentDetails = { upi_id: upiId || "student@upi" };
    } else if (method === "card") {
      paymentDetails = {
        card_last4: cardNumber.slice(-4) || "4111",
        card_network: "Visa",
      };
    } else if (method === "netbanking") {
      paymentDetails = { bank_name: selectedBank };
    }

    const pickupOtp = type === "marketplace_purchase" ? generatePickupOtp() : undefined;

    const transaction = recordPaymentTransaction({
      type,
      type_label: typeLabel || (type === "housing_booking" ? "PG Spot Reservation" : type === "marketplace_purchase" ? "Marketplace Item Purchase" : "Rent Split Share"),
      amount,
      currency: "INR",
      status: "success",
      item_id: itemId,
      item_title: title,
      payer_id: currentUser.id,
      payer_name: currentUser.name,
      payer_email: currentUser.email,
      payer_initials: currentUser.initials,
      payee_id: payeeId,
      payee_name: payeeName,
      payee_email: payeeEmail,
      payment_method: method,
      payment_details: paymentDetails,
      pickup_otp: pickupOtp,
      booking_spot: bookingSpot,
      notes: {
        ...notes,
        mode: "Razorpay Test Gateway",
      },
    });

    setStep("completed");
    await new Promise((resolve) => setTimeout(resolve, 600));

    setIsProcessing(false);
    onOpenChange(false);
    onSuccess(transaction);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        {/* Razorpay Authentic Test Header */}
        <div className="bg-[#0c2340] text-white p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#3395ff] text-white font-black text-sm flex items-center justify-center shadow-xs">
                ₹
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white tracking-tight">
                    Razorpay
                  </h3>
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                    Test Mode
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  CampusLoop Verified Merchant
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Amount to Pay
              </span>
              <span className="text-2xl font-extrabold text-white">
                ₹{amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Item Mini Strip */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
            <span className="font-medium truncate max-w-[240px] text-slate-200">
              {title}
            </span>
            <span className="text-[11px] text-slate-400 shrink-0">
              {description}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        {step === "authenticating" ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-[#3395ff] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[#3395ff]">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Connecting to Razorpay Test Gateway...
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorizing mock payment for ₹{amount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
              <TabsList className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <TabsTrigger value="upi" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#3395ff] text-slate-600 dark:text-slate-400">
                  <Smartphone className="h-3.5 w-3.5" />
                  UPI / QR
                </TabsTrigger>
                <TabsTrigger value="card" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#3395ff] text-slate-600 dark:text-slate-400">
                  <CreditCard className="h-3.5 w-3.5" />
                  Cards
                </TabsTrigger>
                <TabsTrigger value="netbanking" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#3395ff] text-slate-600 dark:text-slate-400">
                  <Building2 className="h-3.5 w-3.5" />
                  NetBanking
                </TabsTrigger>
              </TabsList>

              {/* UPI Tab */}
              <TabsContent value="upi" className="space-y-4 pt-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Enter Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <Input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okaxis or success@razorpay"
                    className="h-10 text-sm font-mono border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="flex gap-2 text-xs">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUpiId("success@razorpay")}
                    className="h-7 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30"
                  >
                    Use Test Success UPI
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUpiId("student@oksbi")}
                    className="h-7 text-[11px] font-medium"
                  >
                    student@oksbi
                  </Button>
                </div>

                <Button
                  className="w-full h-11 bg-[#3395ff] hover:bg-[#287bd5] text-white font-bold text-sm shadow-xs"
                  onClick={() => handleSimulatedPayment("upi")}
                  disabled={isProcessing}
                >
                  Pay ₹{amount.toLocaleString("en-IN")} via UPI
                </Button>
              </TabsContent>

              {/* Card Tab */}
              <TabsContent value="card" className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Card Number
                  </label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 1111 1111 1111"
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Expiry (MM/YY)
                    </label>
                    <Input
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      CVV
                    </label>
                    <Input
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      type="password"
                      maxLength={3}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Preloaded Razorpay Test Visa Card</span>
                  <span className="font-semibold text-emerald-600">Auto-Pass OTP</span>
                </div>

                <Button
                  className="w-full h-11 bg-[#3395ff] hover:bg-[#287bd5] text-white font-bold text-sm shadow-xs"
                  onClick={() => handleSimulatedPayment("card")}
                  disabled={isProcessing}
                >
                  Pay ₹{amount.toLocaleString("en-IN")} with Card
                </Button>
              </TabsContent>

              {/* NetBanking Tab */}
              <TabsContent value="netbanking" className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Select Bank
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Mahindra"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                        selectedBank === b
                          ? "border-[#3395ff] bg-blue-50/50 dark:bg-blue-950/40 text-[#0c2340] dark:text-blue-300 ring-1 ring-[#3395ff]"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full h-11 bg-[#3395ff] hover:bg-[#287bd5] text-white font-bold text-sm shadow-xs"
                  onClick={() => handleSimulatedPayment("netbanking")}
                  disabled={isProcessing}
                >
                  Pay ₹{amount.toLocaleString("en-IN")} with {selectedBank}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Test Helper / Disclaimer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-slate-400" /> 256-bit SSL Sandbox
              </span>
              <button
                type="button"
                onClick={() => handleSimulatedPayment("upi", true)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Test simulated bank decline flow"
              >
                Simulate Decline
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
