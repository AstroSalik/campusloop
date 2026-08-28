"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { 
  Edit3, 
  Image as ImageIcon, 
  MapPin, 
  Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Listing, ListingType } from "@/lib/types";
import { updateListing } from "@/lib/marketplace-data";
import { useUserLocation } from "@/lib/useUserLocation";

interface EditListingDialogProps {
  listing: Listing & { seller_name?: string; seller_email?: string; seller_initials?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (updated: Listing & { seller_name?: string; seller_email?: string; seller_initials?: string }) => void;
}

export function EditListingDialog({
  listing,
  open,
  onOpenChange,
  onUpdated,
}: EditListingDialogProps) {
  const isKnownCategory = ["Furniture", "Cycles", "Electronics", "Appliances", "Books"].includes(listing.category);
  const { detectLocation, loading: detectingLoc } = useUserLocation();
  
  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(String(listing.price));
  const [category, setCategory] = useState(isKnownCategory ? listing.category : "Other");
  const [customCategory, setCustomCategory] = useState(isKnownCategory ? "" : listing.category);
  const [type, setType] = useState<ListingType>(listing.type);
  const [condition, setCondition] = useState(listing.condition || "Good");
  const [locationLabel, setLocationLabel] = useState(listing.location_label || "Hostel 3");
  const [imageUrl, setImageUrl] = useState(
    listing.images && listing.images.length > 0 ? listing.images[0].image_url : ""
  );
  const [description, setDescription] = useState(listing.description);
  const [saving, setSaving] = useState(false);

  const handleUseCurrentLocation = async () => {
    toast.info("Detecting your location via GPS...");
    const detected = await detectLocation();
    if (detected && detected.label) {
      setLocationLabel(detected.label);
      toast.success(`Location set to: ${detected.label}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !description.trim()) {
      toast.error("Please fill in title, price, and description.");
      return;
    }

    if (category === "Other" && !customCategory.trim()) {
      toast.error("Please specify the custom category name.");
      return;
    }

    setSaving(true);
    const finalCategory = category === "Other" && customCategory.trim() ? customCategory.trim() : category;

    const updatedData = {
      title: title.trim(),
      price: Number(price),
      category: finalCategory,
      type,
      condition,
      location_label: locationLabel,
      description: description.trim(),
      images: imageUrl.trim()
        ? [{ id: `img-${listing.id}`, listing_id: listing.id, image_url: imageUrl.trim() }]
        : [],
    };

    updateListing(listing.id, updatedData as any);
    toast.success("Listing updated successfully!");
    
    const updatedFull = {
      ...listing,
      ...updatedData,
    };
    onUpdated(updatedFull as any);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Edit3 className="h-5 w-5 text-primary" />
            Edit Listing
          </DialogTitle>
          <DialogDescription>
            Update details, pricing, condition, or photos for this item.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Listing Title *</label>
            <Input
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

          {/* Custom Category Input if Other */}
          {category === "Other" && (
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <label className="text-xs font-semibold text-slate-700">Custom Category Name *</label>
              <Input
                placeholder="e.g. Musical Instrument, Sports Gear..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            </div>
          )}

          {/* Price & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Price (₹ INR) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">₹</span>
                <Input
                  type="number"
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

          {/* Location with GPS Detection */}
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
                placeholder="e.g. Hostel 3, Main Gate PG, or GPS spot..."
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

          {/* Photo upload from device or URL */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                Item Photo (Upload or Paste URL)
              </label>
              <span className="text-[11px] text-slate-400">Optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-dashed border-slate-300 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-primary cursor-pointer transition-colors">
                <Plus className="h-3.5 w-3.5 text-primary" />
                Upload New Photo
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
                          toast.success("Photo attached!");
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>

              <Input
                type="url"
                placeholder="Or paste image URL (https://...)"
                value={imageUrl.startsWith("data:") ? "" : imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-xs bg-white h-9"
              />
            </div>

            {imageUrl && (
              <div className="relative mt-2 h-32 w-full rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={() => toast.error("Could not load image link.")}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white hover:bg-black/80 text-xs"
                >
                  ✕ Remove
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Description *</label>
            <textarea
              className="flex min-h-[90px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
