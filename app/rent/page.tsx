"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink, 
  History, 
  MapPin, 
  Percent, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  TrendingUp, 
  Users, 
  Wallet 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  RentHealthForm, 
  RentHealthResult, 
  AffordabilityBadge 
} from "@/components/rent";
import { 
  calculateHousingRatio, 
  calculateSplit, 
  evaluateRentHealth, 
  getAffordabilityFlag 
} from "@/lib/rent-engine";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";
import { getRoomById } from "@/lib/housing-data";
import { RazorpayCheckoutModal } from "@/components/payments/RazorpayCheckoutModal";
import { PaymentReceiptDialog } from "@/components/payments/PaymentReceiptDialog";
import { PaymentTransaction } from "@/lib/razorpay-service";

interface CalculationRecord {
  id: string;
  title: string;
  totalCost: number;
  perPersonShare: number;
  occupants: number;
  monthlyIncome: number;
  housingRatioPct: number;
  flag: "comfortable" | "moderate" | "high" | "heavy";
  timestamp: string;
}

const HISTORY_KEY = "campusloop_rent_history";

function RentCalculatorContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;

  const [linkedRoom, setLinkedRoom] = useState<ReturnType<typeof getRoomById> | null>(null);

  // Form State
  const [monthlyIncome, setMonthlyIncome] = useState<number>(currentUser.monthly_income || 15000);
  const [rent, setRent] = useState<number>(18000);
  const [utilities, setUtilities] = useState<number>(1500);
  const [maintenance, setMaintenance] = useState<number>(900);
  const [occupants, setOccupants] = useState<number>(3);

  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState<PaymentTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Pre-fill from roomId if present in query string (PRD Flow C)
  useEffect(() => {
    if (roomId) {
      const r = getRoomById(roomId);
      if (r) {
        setLinkedRoom(r);
        setRent(r.rent);
        setUtilities(r.utilities);
        setMaintenance(r.maintenance);
        setOccupants(r.occupancy_total || 3);
      }
    }
  }, [roomId]);

  // Load calculation history
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Compute live calculations
  const perPersonShare = calculateSplit(rent, utilities, maintenance, occupants);
  const totalCost = rent + utilities + maintenance;
  const assessment = evaluateRentHealth(rent, utilities, maintenance, occupants, monthlyIncome);

  const handleReset = () => {
    setMonthlyIncome(currentUser.monthly_income || 15000);
    setRent(18000);
    setUtilities(1500);
    setMaintenance(900);
    setOccupants(3);
    setSaved(false);
  };

  const handleSaveCalculation = () => {
    const newRecord: CalculationRecord = {
      id: `calc-${Date.now()}`,
      title: linkedRoom?.title || `${occupants} People Split (₹${rent.toLocaleString("en-IN")})`,
      totalCost,
      perPersonShare,
      occupants,
      monthlyIncome,
      housingRatioPct: assessment.housingRatioPct,
      flag: assessment.flag,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [newRecord, ...history.slice(0, 4)];
    setHistory(updated);
    setSaved(true);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {}
    toast.success("Saved calculation to comparison history!");
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {}
    toast.info("Cleared calculation history.");
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Breadcrumb / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Percent className="h-6 w-6 text-primary" />
              Rent Health & Affordability Calculator
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Instant split calculations and financial burden benchmarking against student monthly allowances.
          </p>
        </div>

        {linkedRoom && (
          <Button asChild variant="outline" size="sm" className="self-start sm:self-auto gap-1 border-slate-200">
            <Link href={`/housing/${linkedRoom.id}`}>
              <ExternalLink className="h-3.5 w-3.5" />
              Back to {linkedRoom.title}
            </Link>
          </Button>
        )}
      </div>

      {/* Linked Room Context Banner (When pre-filled from room / chat) */}
      {linkedRoom && (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Pre-filled from: {linkedRoom.title}
                </h3>
                <Badge variant="outline" className="bg-white text-xs">
                  {linkedRoom.location_label}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Base Rent: ₹{linkedRoom.rent.toLocaleString("en-IN")} • Utilities: ₹{linkedRoom.utilities.toLocaleString("en-IN")} • Maintenance: ₹{linkedRoom.maintenance.toLocaleString("en-IN")} • {linkedRoom.occupancy_total} Occupants
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white text-slate-700 font-semibold shadow-2xs">
            Auto Loaded
          </Badge>
        </div>
      )}

      {/* Main Grid: Form Inputs (Left) & Live Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RentHealthForm
          monthlyIncome={monthlyIncome}
          setMonthlyIncome={(v) => { setMonthlyIncome(v); setSaved(false); }}
          rent={rent}
          setRent={(v) => { setRent(v); setSaved(false); }}
          utilities={utilities}
          setUtilities={(v) => { setUtilities(v); setSaved(false); }}
          maintenance={maintenance}
          setMaintenance={(v) => { setMaintenance(v); setSaved(false); }}
          occupants={occupants}
          setOccupants={(v) => { setOccupants(v); setSaved(false); }}
          onReset={handleReset}
        />

        <RentHealthResult
          assessment={assessment}
          totalCost={totalCost}
          perPersonShare={perPersonShare}
          occupants={occupants}
          monthlyIncome={monthlyIncome}
          onSave={handleSaveCalculation}
          saved={saved}
          onPayShare={() => setIsRazorpayModalOpen(true)}
        />
      </div>

      {/* Comparison History */}
      {history.length > 0 && (
        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Recent Saved Calculations
              </CardTitle>
              <CardDescription className="text-xs">
                Compare multiple flats and roommate configurations side by side.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-xs text-slate-400 hover:text-red-600 gap-1 h-8"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((rec) => (
              <div key={rec.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{rec.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total ₹{rec.totalCost.toLocaleString("en-IN")} • {rec.occupants} Flatmates • Share: <strong>₹{rec.perPersonShare.toLocaleString("en-IN")}/mo</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <AffordabilityBadge flag={rec.flag} percentage={rec.housingRatioPct} />
                  <span className="text-[11px] text-slate-400 font-medium">{rec.timestamp}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Razorpay Test Checkout Modal */}
      <RazorpayCheckoutModal
        open={isRazorpayModalOpen}
        onOpenChange={setIsRazorpayModalOpen}
        amount={perPersonShare}
        title={linkedRoom ? `${linkedRoom.title} — Monthly Share` : `Roommate Flat Rent & Utilities Share (${occupants} occupants)`}
        description={`Rent ₹${rent.toLocaleString("en-IN")} + Utilities ₹${(utilities + maintenance).toLocaleString("en-IN")}`}
        type="rent_split"
        typeLabel="Roommate Rent & Utilities Share"
        itemId={linkedRoom?.id || "custom_flat_split"}
        payeeId={linkedRoom?.owner_id}
        payeeName={linkedRoom?.owner_name || "Campus Flatmates"}
        payeeEmail={linkedRoom?.owner_email}
        notes={{
          occupants: occupants.toString(),
          total_flat_cost: totalCost.toString(),
          per_person_share: perPersonShare.toString(),
        }}
        onSuccess={(transaction) => {
          toast.success("Rent share paid successfully via Razorpay test gateway!");
          setReceiptTx(transaction);
          setIsReceiptOpen(true);
        }}
      />

      {/* Verified Digital Payment Receipt Dialog */}
      <PaymentReceiptDialog
        transaction={receiptTx}
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
      />
    </div>
  );
}

export default function RentPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-5xl px-4 py-8 animate-pulse"><div className="h-64 bg-slate-200 rounded-xl" /></div>}>
      <RentCalculatorContent />
    </Suspense>
  );
}
