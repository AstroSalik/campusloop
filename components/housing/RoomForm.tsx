"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Bed, 
  Building2, 
  Calendar, 
  Check, 
  DollarSign, 
  Home, 
  MapPin, 
  Plus, 
  Sparkles, 
  Users 
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
import { saveRoom } from "@/lib/housing-data";
import { useUserLocation } from "@/lib/useUserLocation";

const AVAILABLE_AMENITIES = [
  "WiFi",
  "Geyser",
  "RO Water",
  "AC",
  "Power Backup",
  "Modular Kitchen",
  "Washing Machine",
  "Beds & Mattresses",
  "Study Table",
  "Attached Washroom",
  "Balcony",
  "Daily Cleaning",
  "Food/Mess",
];

export function RoomForm() {
  const router = useRouter();
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;
  const { location: userLoc, detectLocation, loading: detectingLoc } = useUserLocation();

  const [title, setTitle] = useState("");
  const [rent, setRent] = useState("");
  const [utilities, setUtilities] = useState("1200");
  const [maintenance, setMaintenance] = useState("600");
  const [bedrooms, setBedrooms] = useState("2");
  const [occupancyTotal, setOccupancyTotal] = useState("3");
  const [locationLabel, setLocationLabel] = useState(userLoc?.label || "Main Gate PG");
  const [availableFrom, setAvailableFrom] = useState("Sept 1st");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "WiFi",
    "Geyser",
    "Power Backup",
  ]);
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

  const toggleAmenity = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rent) {
      toast.error("Please enter the room title and monthly rent.");
      return;
    }

    setLoading(true);
    const newRoomId = `room-custom-${Date.now().toString(36)}`;

    const newRoom = {
      id: newRoomId,
      owner_id: currentUser.id,
      owner_name: currentUser.name,
      owner_email: currentUser.email,
      owner_initials: currentUser.initials,
      campus_id: DEMO_CAMPUS_ID,
      title: title.trim(),
      rent: Number(rent),
      utilities: Number(utilities) || 0,
      maintenance: Number(maintenance) || 0,
      bedrooms: Number(bedrooms) || 1,
      occupancy_total: Number(occupancyTotal) || 1,
      occupancy_filled: 0,
      amenities: selectedAmenities,
      location_label: locationLabel,
      available_from: availableFrom.trim() || "Immediate",
      status: "available" as const,
      created_at: new Date().toISOString(),
      images: imageUrl.trim() ? [{ id: `img-${newRoomId}`, room_id: newRoomId, image_url: imageUrl.trim() }] : [],
    };

    saveRoom(newRoom);
    toast.success("Housing listing posted! Ready for roommate inquiries.");
    router.push(`/housing/${newRoomId}`);
    setLoading(false);
  };

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          List Flat, Room, or PG
        </CardTitle>
        <CardDescription>
          Post available accommodation to find verified student flatmates.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Accommodation Title *
            </label>
            <Input
              placeholder="e.g. 2BHK Near Main Gate (Spacious & Furnished)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Pricing Row: Rent, Utilities, Maintenance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Monthly Total Rent (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">₹</span>
                <Input
                  type="number"
                  placeholder="18000"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="pl-7 font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Est. Utilities (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">₹</span>
                <Input
                  type="number"
                  placeholder="1500"
                  value={utilities}
                  onChange={(e) => setUtilities(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Maintenance (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">₹</span>
                <Input
                  type="number"
                  placeholder="900"
                  value={maintenance}
                  onChange={(e) => setMaintenance(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms & Occupancy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Bedrooms</label>
              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger>
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 BHK / Single Room</SelectItem>
                  <SelectItem value="2">2 BHK</SelectItem>
                  <SelectItem value="3">3 BHK</SelectItem>
                  <SelectItem value="4">4+ BHK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Total Occupancy Capacity</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={occupancyTotal}
                onChange={(e) => setOccupancyTotal(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Available From</label>
              <Input
                placeholder="e.g. Sept 1st"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />
            </div>
          </div>

          {/* Accommodation Location with GPS Detection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Accommodation Location / Area *
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
                placeholder="e.g. Main Gate PG, Lovely Nagar, or GPS detected area..."
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                className="pl-9 bg-white text-xs h-9 font-medium"
                required
              />
            </div>

            {/* Quick Preset Location Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Quick Select:</span>
              {["Main Gate PG", "Lovely Nagar PG", "Hostel 1 area", "Hostel 2 area", "Hostel 3", "Hostel 5"].map((spot) => (
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

          {/* Room Photo Upload / URL Paste with Live Preview */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Room / Flat Photo</span>
              </label>
              <span className="text-[11px] text-slate-400">Optional</span>
            </div>

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
                          toast.success("Room photo attached successfully!");
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
              <div className="relative mt-2 h-36 w-full rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Room Preview"
                  className="h-full w-full object-cover"
                  onError={() => toast.error("Could not load image link.")}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white hover:bg-black/80 text-xs transition-colors"
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

          {/* Amenities Multi-Select Tag Chips */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-700">
              Amenities & Features (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-2xs font-semibold"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {amenity}
                  </button>
                );
              })}
            </div>
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
            {loading ? "Publishing..." : "Post Room Listing"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
