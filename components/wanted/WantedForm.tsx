"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Building2, 
  Check, 
  DollarSign, 
  HandHeart, 
  MapPin, 
  Package, 
  Plus, 
  Sparkles, 
  Tag 
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { getClientDemoSession, PRIMARY_DEMO_USER, DEMO_CAMPUS_ID } from "@/lib/auth";
import { saveWantedListing, StoredWantedListing } from "@/lib/wanted-data";
import { useUserLocation } from "@/lib/useUserLocation";

export function WantedForm() {
  const router = useRouter();
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;
  const { location: userLoc, detectLocation, loading: detectingLoc } = useUserLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [category, setCategory] = useState("Furniture");
  const [customCategory, setCustomCategory] = useState("");
  const [locationLabel, setLocationLabel] = useState(userLoc?.label || "Hostel 3");
  const [loading, setLoading] = useState(false);

  const handleUseCurrentLocation = async () => {
    toast.info("Detecting your location via GPS...");
    const detected = await detectLocation();
    if (detected && detected.label) {
      setLocationLabel(detected.label);
      toast.success(`Location set to: ${detected.label}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !budgetMax || !description.trim()) {
      toast.error("Please fill in the title, max budget, and description.");
      return;
    }

    if (category === "Other" && !customCategory.trim()) {
      toast.error("Please specify your custom category.");
      return;
    }

    if (Number(budgetMax) <= 0) {
      toast.error("Please enter a valid positive budget ceiling.");
      return;
    }

    setLoading(true);
    const newId = `w-custom-${Date.now().toString(36)}`;
    const finalCategory = category === "Other" && customCategory.trim() ? customCategory.trim() : category;

    const newWantedListing: StoredWantedListing = {
      id: newId,
      requester_id: currentUser.id,
      requester_name: currentUser.name,
      requester_email: currentUser.email,
      requester_initials: currentUser.initials,
      campus_id: DEMO_CAMPUS_ID,
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      budget_max: Number(budgetMax),
      status: "active",
      location_label: locationLabel,
      created_at: new Date().toISOString(),
    };

    saveWantedListing(newWantedListing);
    toast.success("Wanted request published! Sellers across campus will be able to contact you.");
    router.push(`/wanted/${newId}`);
    setLoading(false);
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Post What You Need (Wanted Request)
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
              Tell campus students what item you are looking to buy and your maximum budget.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              What are you looking for? *
            </label>
            <Input
              placeholder="e.g. Looking for a mini fridge under ₹2500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
            <p className="text-[11px] text-slate-400">
              Be specific about the item name, model, or condition you prefer.
            </p>
          </div>

          {/* Category & Budget Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category *</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Cycles">Cycles</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Appliances">Appliances</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Other">Other (Specify below)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Maximum Budget Ceiling (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">
                  ₹
                </span>
                <Input
                  type="number"
                  placeholder="2500"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="pl-7 font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400">
                The highest amount you are willing to spend.
              </p>
            </div>
          </div>

          {/* Dynamic Custom Category Textbox when "Other" is selected */}
          {category === "Other" && (
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 animate-in fade-in-50 duration-200">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Custom Category Name *</span>
                <span className="text-[10px] text-primary dark:text-teal-400 font-normal">Specify category</span>
              </label>
              <Input
                placeholder="e.g. Lab Equipment, Musical Instrument, Sports Gear..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
                autoFocus
              />
            </div>
          )}

          {/* Location / Hostel */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Hostel / Preferred Pickup Location *
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={detectingLoc}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary dark:text-teal-400 hover:opacity-80 transition-opacity"
              >
                <MapPin className="h-3 w-3" />
                {detectingLoc ? "Detecting GPS..." : "📍 Use Current Location"}
              </button>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="e.g. Hostel 3, Main Gate PG..."
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                className="pl-9 bg-white dark:bg-slate-800 text-xs h-9 font-medium text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Quick Select:</span>
              {["Hostel 3", "Hostel 1", "Hostel 2", "Hostel 5", "Main Gate PG", "Lovely Nagar PG"].map((spot) => (
                <button
                  key={spot}
                  type="button"
                  onClick={() => setLocationLabel(spot)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                    locationLabel === spot
                      ? "bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700 font-semibold"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {spot}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Details & Requirements *
            </label>
            <textarea
              className="flex min-h-[100px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-xs placeholder:text-slate-400 text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Describe what you need: size, preferred brands, condition accepted, timeline (e.g. need before semester exams)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-850/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {loading ? "Publishing..." : "Publish Wanted Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
