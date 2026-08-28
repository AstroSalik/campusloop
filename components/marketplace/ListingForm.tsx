"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Building2, 
  Check, 
  DollarSign, 
  Image as ImageIcon, 
  Link as LinkIcon, 
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
import { saveListing } from "@/lib/marketplace-data";
import { ListingType } from "@/lib/types";
import { useUserLocation } from "@/lib/useUserLocation";

export function ListingForm() {
  const router = useRouter();
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;
  const { location: userLoc, detectLocation, loading: detectingLoc } = useUserLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Furniture");
  const [customCategory, setCustomCategory] = useState("");
  const [type, setType] = useState<ListingType>("sell");
  const [condition, setCondition] = useState("Good");
  const [locationLabel, setLocationLabel] = useState(userLoc?.label || "Hostel 3");
  const [imageUrl, setImageUrl] = useState("");
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
    if (!title.trim() || !price || !description.trim()) {
      toast.error("Please fill in the title, price, and description.");
      return;
    }

    if (category === "Other" && !customCategory.trim()) {
      toast.error("Please specify your custom category.");
      return;
    }

    setLoading(true);
    const newId = `listing-custom-${Date.now().toString(36)}`;
    const finalCategory = category === "Other" && customCategory.trim() ? customCategory.trim() : category;

    const newListing = {
      id: newId,
      seller_id: currentUser.id,
      seller_name: currentUser.name,
      seller_email: currentUser.email,
      seller_initials: currentUser.initials,
      campus_id: DEMO_CAMPUS_ID,
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      type,
      price: Number(price),
      condition,
      location_label: locationLabel,
      status: "active" as const,
      created_at: new Date().toISOString(),
      images: imageUrl.trim() ? [{ id: `img-${newId}`, listing_id: newId, image_url: imageUrl.trim() }] : [],
    };

    saveListing(newListing);
    toast.success("Listing posted successfully to campus marketplace!");
    router.push(`/marketplace/${newId}`);
    setLoading(false);
  };

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          Post Item to Campus Marketplace
        </CardTitle>
        <CardDescription>
          List student essentials for sale, rent, or post a wanted request.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Listing Title *
            </label>
            <Input
              placeholder="e.g. Firefox Single Speed Cycle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Type & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Listing Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["sell", "rent", "buy"] as ListingType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 text-xs font-semibold rounded-lg border capitalize transition-all ${
                      type === t
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {t === "sell" ? "For Sale" : t === "rent" ? "For Rent" : "Wanted"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
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
          </div>

          {/* Dynamic Custom Category Textbox when "Other" is selected */}
          {category === "Other" && (
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 animate-in fade-in-50 duration-200">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Custom Category Name *</span>
                <span className="text-[10px] text-primary font-normal">Specify category</span>
              </label>
              <Input
                placeholder="e.g. Lab Equipment, Musical Instrument, Sports Gear..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="bg-white"
                required
                autoFocus
              />
            </div>
          )}

          {/* Price & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Price (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">
                  ₹
                </span>
                <Input
                  type="number"
                  placeholder="3500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-7 font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Condition</label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brand New">Brand New (Unopened / Unused)</SelectItem>
                  <SelectItem value="Like New">Like New (Mint condition)</SelectItem>
                  <SelectItem value="Good">Good (Minor wear)</SelectItem>
                  <SelectItem value="Fair">Fair (Fully functional)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campus Location with GPS & Current Location Detection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Pickup Spot / Campus Location *
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={detectingLoc}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <MapPin className="h-3 w-3" />
                {detectingLoc ? "Detecting GPS..." : "📍 Use Current Location"}
              </button>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="e.g. Hostel 3, Main Gate PG, or GPS location..."
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                className="pl-9 bg-white text-xs h-9 font-medium"
                required
              />
            </div>

            {/* Quick Preset Location Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Quick Select:</span>
              {["Hostel 3", "Hostel 1", "Hostel 2", "Hostel 5", "Main Gate PG", "Lovely Nagar PG"].map((spot) => (
                <button
                  key={spot}
                  type="button"
                  onClick={() => setLocationLabel(spot)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                    locationLabel === spot
                      ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {spot}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload & URL with Live Preview */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                Item Photo (Upload or Paste URL)
              </label>
              <span className="text-[11px] text-slate-400">Optional</span>
            </div>

            {/* Direct File Upload & URL input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-dashed border-slate-300 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-primary cursor-pointer transition-colors">
                <Plus className="h-3.5 w-3.5 text-primary" />
                Upload Photo from Device
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("Image file should be under 5MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          setImageUrl(ev.target.result as string);
                          toast.success("Photo attached successfully!");
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>

              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="url"
                  placeholder="Or paste image URL (e.g. https://...)"
                  value={imageUrl.startsWith("data:") ? "" : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="pl-9 text-xs bg-white h-9"
                />
              </div>
            </div>

            {/* Live Preview Box */}
            {imageUrl && (
              <div className="relative mt-2 h-36 w-full rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={() => {
                    toast.error("Image URL could not be loaded. Please check the link or upload a file.");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white hover:bg-black/80 text-xs transition-colors"
                  title="Remove image"
                >
                  ✕ Remove
                </button>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    ✓ Photo Ready
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Item Description *
            </label>
            <textarea
              className="flex min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Describe condition, age, accessories included, reason for selling..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-100 p-5 bg-slate-50/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            {loading ? "Posting..." : "Publish Listing"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
