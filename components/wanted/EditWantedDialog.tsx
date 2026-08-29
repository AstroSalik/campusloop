"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { 
  Building2, 
  Check, 
  DollarSign, 
  Edit3, 
  MapPin, 
  Sparkles, 
  Tag 
} from "lucide-react";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StoredWantedListing, updateWantedListing } from "@/lib/wanted-data";

interface EditWantedDialogProps {
  wanted: StoredWantedListing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (updated: StoredWantedListing) => void;
}

export function EditWantedDialog({
  wanted,
  open,
  onOpenChange,
  onUpdated,
}: EditWantedDialogProps) {
  const [title, setTitle] = useState(wanted.title);
  const [description, setDescription] = useState(wanted.description);
  const [budgetMax, setBudgetMax] = useState(String(wanted.budget_max));
  const [category, setCategory] = useState(wanted.category);
  const [locationLabel, setLocationLabel] = useState(wanted.location_label || "Hostel 3");
  const [status, setStatus] = useState(wanted.status);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !budgetMax || !description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    const updatedFields: Partial<StoredWantedListing> = {
      title: title.trim(),
      description: description.trim(),
      budget_max: Number(budgetMax),
      category,
      location_label: locationLabel,
      status,
    };

    updateWantedListing(wanted.id, updatedFields);
    const updated = { ...wanted, ...updatedFields };
    onUpdated(updated as StoredWantedListing);
    toast.success("Wanted request updated successfully!");
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-primary dark:text-teal-400" />
            Edit Wanted Request
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Update your item request details or mark it as fulfilled.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Request Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Cycles">Cycles</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Appliances">Appliances</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Max Budget (₹)</label>
              <Input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location / Hostel</label>
              <Input
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status</label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Still Looking)</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled (Found item)</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              className="flex min-h-[90px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
