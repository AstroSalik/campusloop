"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  Compass,
  DollarSign,
  Heart,
  MessageSquare,
  Package,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function StyleGuidePage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              CampusLoop Design System & Style Guide
            </h1>
            <p className="text-sm text-slate-500">
              Visual language validation: light theme, deep blue brand, and 4 affordability flag tokens.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Color Palette & Affordability Flags */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          1. Brand Palette & Affordability Flags (Project-Context Section 4)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
            <div className="h-12 w-full rounded-lg bg-primary flex items-center justify-center text-white font-mono text-xs font-semibold">
              #1E3A8A
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Primary Deep Blue</p>
              <p className="text-xs text-slate-500">Brand identity & CTAs</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
            <div className="h-12 w-full rounded-lg bg-flag-comfortable flex items-center justify-center text-white font-mono text-xs font-semibold">
              #16A34A (0–30%)
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">🟢 Comfortable</p>
              <p className="text-xs text-slate-500">Low housing burden</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
            <div className="h-12 w-full rounded-lg bg-flag-moderate flex items-center justify-center text-white font-mono text-xs font-semibold">
              #CA8A04 (30–40%)
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">🟡 Moderate</p>
              <p className="text-xs text-slate-500">Manageable budget</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
            <div className="h-12 w-full rounded-lg bg-flag-high flex items-center justify-center text-white font-mono text-xs font-semibold">
              #EA580C (40–50%)
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-800">🟠 High</p>
              <p className="text-xs text-slate-500">Tight monthly buffer</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
            <div className="h-12 w-full rounded-lg bg-flag-heavy flex items-center justify-center text-white font-mono text-xs font-semibold">
              #DC2626 (50%+)
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">🔴 Heavy</p>
              <p className="text-xs text-slate-500">Excessive rent ratio</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Badges & Chips */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          2. Badges & Affordability Chips
        </h2>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <Badge variant="default">Primary Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
          <Badge variant="outline">Outline Badge</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <Badge variant="comfortable">🟢 28% Comfortable</Badge>
          <Badge variant="moderate">🟡 36% Moderate</Badge>
          <Badge variant="high">🟠 44% High</Badge>
          <Badge variant="heavy">🔴 54% Heavy</Badge>
        </div>
      </section>

      {/* 3. Buttons & Toast Trigger */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          3. Buttons & Interactive Toasts
        </h2>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <Button onClick={() => toast.success("Listing posted successfully!")}>
            <Plus className="mr-2 h-4 w-4" />
            Primary (Toast Success)
          </Button>
          <Button variant="secondary" onClick={() => toast.info("Message thread updated.")}>
            Secondary (Toast Info)
          </Button>
          <Button variant="outline" onClick={() => toast("Rent split calculated: ₹6,000/person")}>
            Outline (Toast Default)
          </Button>
          <Button variant="destructive" onClick={() => toast.error("Unable to delete listing")}>
            Destructive (Toast Error)
          </Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large Action</Button>
        </div>
      </section>

      {/* 4. Form Controls */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          4. Form Inputs & Selects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Listing Title
            </label>
            <Input placeholder="e.g. Study Table with Drawer" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Category
            </label>
            <Select defaultValue="furniture">
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="cycles">Cycles</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="appliances">Appliances</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Expected Rent (₹)
            </label>
            <Input type="number" placeholder="18000" defaultValue="18000" />
          </div>
        </div>
      </section>

      {/* 5. Tabs & Cards Sample */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          5. Tabs, Cards & Modals
        </h2>
        <Tabs defaultValue="sample-card" className="w-full">
          <TabsList>
            <TabsTrigger value="sample-card">Sample Listing Card</TabsTrigger>
            <TabsTrigger value="sample-room">Sample Room Card</TabsTrigger>
            <TabsTrigger value="sample-split">Rent Health Result Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="sample-card" className="mt-4">
            <div className="max-w-sm">
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-44 w-full bg-slate-100 flex items-center justify-center text-slate-400 border-b border-slate-100">
                  <Package className="h-10 w-10 text-slate-300" />
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Cycles</Badge>
                    <span className="text-xs font-medium text-slate-500">Hostel 5</span>
                  </div>
                  <CardTitle className="text-base mt-1">Firefox Single Speed Cycle</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Barely used, 4 months old with front basket and lock included.
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-lg font-bold text-slate-900">₹3,500</span>
                    <Button size="sm">Message Seller</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sample-room" className="mt-4">
            <div className="max-w-sm">
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-44 w-full bg-primary/5 flex items-center justify-center text-primary/40 border-b border-slate-100">
                  <Building2 className="h-10 w-10 text-primary/40" />
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
                      1 Spot Available
                    </Badge>
                    <span className="text-xs font-medium text-slate-500">Near Main Gate</span>
                  </div>
                  <CardTitle className="text-base mt-1">2BHK Near Main Gate</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">WiFi</Badge>
                    <Badge variant="secondary" className="text-[10px]">Geyser</Badge>
                    <Badge variant="secondary" className="text-[10px]">Power Backup</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-lg font-bold text-slate-900">₹18,000</span>
                      <span className="text-xs text-slate-500"> /mo total</span>
                    </div>
                    <Button size="sm">I&apos;m Interested</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sample-split" className="mt-4">
            <div className="max-w-md">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Rent Health Breakdown</CardTitle>
                    <Badge variant="high">🟠 45% High</Badge>
                  </div>
                  <CardDescription>Split 3 ways against ₹15,000 monthly income</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg bg-slate-50 p-3 flex justify-between items-center">
                    <span className="text-sm text-slate-600">Per-Person Share</span>
                    <span className="text-xl font-bold text-slate-900">₹6,800</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Housing cost consumes 45% of your income. Consider finding 1 more flatmate to bring your share under 35%.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog Demo */}
        <div className="pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Open Sample Dialog Modal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Express Interest in 2BHK Near Main Gate</DialogTitle>
                <DialogDescription>
                  Joining will add you to the prospective roommate group chat with the owner and other interested students.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2 text-sm text-slate-600 space-y-2">
                <p>• Owner: <strong>Vikram Iyer</strong></p>
                <p>• Estimated Share: <strong>₹6,800/mo (split 3 ways)</strong></p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setDialogOpen(false);
                    toast.success("Joined roommate group chat!");
                  }}
                >
                  Join Chat
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* 6. Empty State Component */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          6. Empty State Component (Project-Context Section 4)
        </h2>
        <EmptyState
          icon={ShoppingBag}
          title="No listings found for your search"
          description="Try searching with a different keyword or browse other categories on campus."
          actionLabel="Clear Filters & Browse All"
          onAction={() => toast("Filters cleared")}
        />
      </section>

      {/* 7. Loading Skeleton Component */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          7. Loading Skeleton Component
        </h2>
        <LoadingSkeleton count={3} />
      </section>
    </div>
  );
}
