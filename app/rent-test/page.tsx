"use client";

import React, { useState } from "react";
import { 
  Building2, 
  Calculator, 
  CheckCircle2, 
  Compass, 
  DollarSign, 
  Sparkles, 
  Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  evaluateRentHealth, 
  AFFORDABILITY_THRESHOLDS 
} from "@/lib/rent-engine";

export default function RentTestPage() {
  const [rent, setRent] = useState(18000);
  const [utilities, setUtilities] = useState(1500);
  const [maintenance, setMaintenance] = useState(900);
  const [occupants, setOccupants] = useState(3);
  const [income, setIncome] = useState(15000);

  const result = evaluateRentHealth(rent, utilities, maintenance, occupants, income);

  const presets = [
    { label: "Comfortable (🟢 20%)", r: 8000, u: 800, m: 400, o: 3, inc: 15000 },
    { label: "Moderate (🟡 38%)", r: 12000, u: 1200, m: 500, o: 2, inc: 18000 },
    { label: "Demo Room #1 (🟠 45%)", r: 18000, u: 1500, m: 900, o: 3, inc: 15000 },
    { label: "Heavy (🔴 60%)", r: 24000, u: 2000, m: 1000, o: 3, inc: 15000 },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Rent Engine Unit Sanity Test
        </h1>
        <p className="text-sm text-slate-500">
          Interactive verification of pure calculation logic in <code>/lib/rent-engine.ts</code>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-slate-500 self-center mr-2">Test Presets:</span>
        {presets.map((p, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={() => {
              setRent(p.r);
              setUtilities(p.u);
              setMaintenance(p.m);
              setOccupants(p.o);
              setIncome(p.inc);
            }}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">Input Parameters</CardTitle>
            <CardDescription>Adjust amounts to observe live flag recalculation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Total Monthly Rent (₹)</label>
              <Input
                type="number"
                value={rent}
                onChange={(e) => setRent(Number(e.target.value) || 0)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Utilities (₹)</label>
                <Input
                  type="number"
                  value={utilities}
                  onChange={(e) => setUtilities(Number(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Maintenance (₹)</label>
                <Input
                  type="number"
                  value={maintenance}
                  onChange={(e) => setMaintenance(Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Total Occupants</label>
                <Input
                  type="number"
                  min={1}
                  value={occupants}
                  onChange={(e) => setOccupants(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Monthly Income/Allowance (₹)</label>
                <Input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Calculation Output */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Evaluation Result</CardTitle>
              <Badge variant={result.flag}>
                {result.flagEmoji} {result.flagLabel} ({result.housingRatioPct}%)
              </Badge>
            </div>
            <CardDescription>Computed using pure mathematical formulas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-xs text-slate-500">Total Accommodation</span>
                <p className="text-lg font-bold text-slate-900">₹{result.totalCost.toLocaleString("en-IN")}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-xs text-slate-500">Per-Person Share</span>
                <p className="text-lg font-bold text-primary">₹{result.perPersonShare.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-700">Housing Burden Ratio</span>
                <span className="font-bold text-slate-900">{result.housingRatioPct}% of income</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{result.description}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1 font-mono">
              <div>Formula: Share = (₹{rent} + ₹{utilities} + ₹{maintenance}) / {occupants} = ₹{result.perPersonShare}</div>
              <div>Ratio = (₹{result.perPersonShare} / ₹{income}) * 100 = {result.housingRatioPct}%</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
