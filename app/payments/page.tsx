"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Building2, 
  CheckCircle2, 
  CreditCard, 
  Download, 
  FileText, 
  Filter, 
  Home, 
  Lock, 
  Package, 
  Percent, 
  Printer, 
  Receipt, 
  Search, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles, 
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
import { Input } from "@/components/ui/input";
import { 
  getTransactions, 
  PaymentTransaction 
} from "@/lib/razorpay-service";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";
import { PaymentReceiptDialog } from "@/components/payments/PaymentReceiptDialog";
import { EmptyState } from "@/components/shared/EmptyState";

export default function PaymentsPage() {
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const refreshTransactions = () => {
    const list = getTransactions();
    setTransactions(list);
  };

  useEffect(() => {
    refreshTransactions();

    const handleUpdate = () => refreshTransactions();
    window.addEventListener("campusloop_transactions_updated", handleUpdate);
    return () => window.removeEventListener("campusloop_transactions_updated", handleUpdate);
  }, []);

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesSearch =
      tx.item_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.payee_name && tx.payee_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const totalSpent = transactions
    .filter((tx) => tx.payer_id === currentUser.id && tx.status === "success")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalHousingBookings = transactions.filter((tx) => tx.type === "housing_booking").length;
  const totalMarketplaceOrders = transactions.filter((tx) => tx.type === "marketplace_purchase").length;
  const totalRentSplits = transactions.filter((tx) => tx.type === "rent_split").length;

  const handleOpenReceipt = (tx: PaymentTransaction) => {
    setSelectedTx(tx);
    setIsReceiptOpen(true);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-8 -ml-2 text-slate-500 gap-1">
              <Link href="/profile">
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <Receipt className="h-7 w-7 text-primary" />
            Payments & Receipts Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verified digital payment receipts for accommodation bookings, marketplace purchases, and rent shares.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-[#0c2340] text-[#3395ff] border-blue-900 text-xs px-3 py-1 font-bold">
            <Lock className="h-3 w-3 mr-1.5" /> Razorpay Test Gateway
          </Badge>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-4 space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Paid (Demo)</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{totalSpent.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> All 100% Escrow Protected
          </span>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-4 space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">PG & Room Bookings</span>
          <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
            {totalHousingBookings}
          </p>
          <span className="text-[11px] text-slate-400 block">Spot reservation deposits</span>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-4 space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Marketplace Orders</span>
          <p className="text-2xl font-extrabold text-primary">
            {totalMarketplaceOrders}
          </p>
          <span className="text-[11px] text-slate-400 block">Items bought on campus</span>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs p-4 space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rent Splits Settled</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalRentSplits}
          </p>
          <span className="text-[11px] text-slate-400 block">Monthly roommate shares</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {[
            { id: "all", label: "All Records" },
            { id: "housing_booking", label: "PG Bookings" },
            { id: "marketplace_purchase", label: "Marketplace" },
            { id: "rent_split", label: "Rent Splits" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === tab.id
                  ? "bg-white dark:bg-slate-900 text-primary dark:text-teal-300 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search receipt / ID..."
            className="pl-9 h-9 text-xs border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>

      {/* Transaction Records List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          description="There are no payment records matching your filter criteria."
          actionLabel="View All Payments"
          onAction={() => {
            setFilterType("all");
            setSearchQuery("");
          }}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((tx) => (
            <Card
              key={tx.id}
              className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden"
            >
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Icon & Item Info */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === "housing_booking"
                        ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                        : tx.type === "marketplace_purchase"
                        ? "bg-blue-50 dark:bg-blue-950/60 text-[#3395ff] border border-blue-200 dark:border-blue-800"
                        : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    }`}
                  >
                    {tx.type === "housing_booking" ? (
                      <Building2 className="h-5 w-5" />
                    ) : tx.type === "marketplace_purchase" ? (
                      <ShoppingBag className="h-5 w-5" />
                    ) : (
                      <Percent className="h-5 w-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        {tx.item_title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {tx.type_label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        {tx.id}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(tx.created_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {tx.booking_spot && (
                        <>
                          <span>•</span>
                          <span className="text-teal-600 dark:text-teal-400 font-semibold">
                            Spot #{tx.booking_spot}
                          </span>
                        </>
                      )}
                      {tx.pickup_otp && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            OTP: {tx.pickup_otp}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & View Receipt Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block flex items-center sm:justify-end gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Paid via {tx.payment_method.toUpperCase()}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenReceipt(tx)}
                    className="h-8 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700"
                  >
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    View Receipt
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Digital Receipt Modal */}
      <PaymentReceiptDialog
        transaction={selectedTx}
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
      />
    </div>
  );
}
