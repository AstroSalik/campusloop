"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Building2, 
  Calendar, 
  Check, 
  DollarSign, 
  Filter, 
  Heart, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Plus, 
  Search, 
  Sparkles, 
  Tag, 
  UserCheck, 
  Users, 
  Users2, 
  X 
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getRoommateProfiles, saveRoommateProfile } from "@/lib/housing-data";
import { getClientDemoSession, PRIMARY_DEMO_USER, DEMO_USERS } from "@/lib/auth";
import { getOrCreateRoommateConversation } from "@/lib/conversations";

const AVAILABLE_TAGS = [
  "Quiet Study",
  "Early Bird",
  "Night Owl",
  "Vegetarian",
  "Non-Smoker",
  "Clean & Tidy",
  "Tech Enthusiast",
  "Fitness",
  "Music OK",
  "Cat Friendly",
  "Chill Vibes",
];

export default function RoommatesPage() {
  const router = useRouter();
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;

  const [profiles, setProfiles] = useState<ReturnType<typeof getRoommateProfiles>>([]);
  const [loading, setLoading] = useState(true);

  // Simple plain filters per PRD Section 3
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("");

  // Create Profile Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [budgetMin, setBudgetMin] = useState("6000");
  const [budgetMax, setBudgetMax] = useState("9000");
  const [preferredLocation, setPreferredLocation] = useState("Main Gate PG");
  const [moveInMonth, setMoveInMonth] = useState("September");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Quiet Study",
    "Non-Smoker",
    "Clean & Tidy",
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProfiles(getRoommateProfiles());
      setLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile = {
      id: `prof-${Date.now().toString(36)}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_email: currentUser.email,
      user_initials: currentUser.initials,
      budget_min: Number(budgetMin) || 5000,
      budget_max: Number(budgetMax) || 9000,
      preferred_location: preferredLocation,
      move_in_month: moveInMonth,
      lifestyle_tags: selectedTags,
      created_at: new Date().toISOString(),
    };

    saveRoommateProfile(newProfile);
    setProfiles([newProfile, ...profiles]);
    setIsDialogOpen(false);
    toast.success("Roommate preference profile published!");
  };

  // Plain filtering (no scoring engine)
  const filteredProfiles = profiles.filter((p) => {
    if (selectedLocation !== "all") {
      if (!p.preferred_location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }
    }
    if (selectedMonth !== "all") {
      if (p.move_in_month.toLowerCase() !== selectedMonth.toLowerCase()) {
        return false;
      }
    }
    if (budgetFilter) {
      const b = Number(budgetFilter);
      if (b > 0 && (b < p.budget_min || b > p.budget_max)) {
        return false;
      }
    }
    return true;
  });

  const clearFilters = () => {
    setSelectedLocation("all");
    setSelectedMonth("all");
    setBudgetFilter("");
  };

  const handleContactRoommate = async (profileUser: typeof profiles[0]) => {
    if (profileUser.user_id === currentUser.id) {
      toast.info("This is your own roommate profile!");
      return;
    }
    try {
      const convId = await getOrCreateRoommateConversation(
        currentUser.id,
        profileUser.user_id
      );
      toast.success(`Connected with ${profileUser.user_name}! Opening chat...`);
      router.push(`/messages/${convId}`);
    } catch (e) {
      toast.error("Could not open chat.");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Campus Roommate Finder
            </h1>
            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs">
              {filteredProfiles.length} Students Looking
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Connect with students sharing similar campus budgets, move-in timelines, and lifestyles.
          </p>
        </div>

        {/* Create/Edit Profile Modal Trigger */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shadow-xs self-start sm:self-auto">
              <Plus className="mr-1.5 h-4 w-4" />
              Post Roommate Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Post Your Roommate Preferences</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400">
                Share your budget and habits so flatmates can reach out to you.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Min Budget (₹)</label>
                  <Input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Max Budget (₹)</label>
                  <Input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Preferred Area</label>
                  <Select value={preferredLocation} onValueChange={setPreferredLocation}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      <SelectValue placeholder="Area" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                      <SelectItem value="Main Gate PG">Main Gate PG</SelectItem>
                      <SelectItem value="Hostel 1">Hostel 1</SelectItem>
                      <SelectItem value="Hostel 2 area">Hostel 2 area</SelectItem>
                      <SelectItem value="Hostel 3">Hostel 3</SelectItem>
                      <SelectItem value="Hostel 5">Hostel 5</SelectItem>
                      <SelectItem value="Lovely Nagar PG">Lovely Nagar PG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Move-in Month</label>
                  <Select value={moveInMonth} onValueChange={setMoveInMonth}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                      <SelectItem value="September">September</SelectItem>
                      <SelectItem value="October">October</SelectItem>
                      <SelectItem value="Immediate">Immediate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Lifestyle & Habits Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                          isSelected
                            ? "bg-primary text-white border-primary font-medium"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Publish Profile</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Simple Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Preferred Location
          </label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Main Gate">Main Gate PG</SelectItem>
              <SelectItem value="Hostel 1">Hostel 1</SelectItem>
              <SelectItem value="Hostel 2">Hostel 2 area</SelectItem>
              <SelectItem value="Hostel 3">Hostel 3</SelectItem>
              <SelectItem value="Hostel 5">Hostel 5</SelectItem>
              <SelectItem value="Lovely Nagar">Lovely Nagar PG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Target Budget (₹)
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
            <Input
              type="number"
              placeholder="e.g. 7000"
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className="h-9 pl-6 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Move-in Month
          </label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
              <SelectValue placeholder="Any Month" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <SelectItem value="all">Any Month</SelectItem>
              <SelectItem value="September">September</SelectItem>
              <SelectItem value="October">October</SelectItem>
              <SelectItem value="Immediate">Immediate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-9 w-full text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : filteredProfiles.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No roommate profiles found"
          description="Try broadening your location or budget filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProfiles.map((p) => {
            const isMe = p.user_id === currentUser.id;
            return (
              <Card
                key={p.id}
                className="border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-800/95 shadow-xs hover:shadow-lg hover:border-primary/50 dark:hover:border-teal-400/60 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-700/70 bg-gradient-to-br from-transparent to-slate-50/50 dark:to-slate-900/40">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/20 dark:border-teal-400/40 shadow-xs">
                          {(() => {
                            const matchedUser = DEMO_USERS.find((u) => u.id === p.user_id);
                            return matchedUser?.avatar ? (
                              <img
                                src={matchedUser.avatar}
                                alt={p.user_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <AvatarFallback className="bg-primary/10 dark:bg-teal-950/90 text-primary dark:text-teal-300 font-extrabold text-sm">
                                {p.user_initials || p.user_name[0]}
                              </AvatarFallback>
                            );
                          })()}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                              {p.user_name}
                            </CardTitle>
                            {isMe && (
                              <Badge className="bg-teal-600 text-white text-[9px] px-1.5 py-0 font-bold">You</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5 font-medium">
                            <MapPin className="h-3.5 w-3.5 text-primary dark:text-teal-400 shrink-0" />
                            Prefers <span className="text-slate-900 dark:text-white font-semibold">{p.preferred_location}</span>
                          </p>
                        </div>
                      </div>

                      <Badge variant="outline" className="bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-teal-200 border-slate-200 dark:border-slate-600 text-[10px] font-bold shrink-0 shadow-2xs">
                        From {p.move_in_month}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-3 space-y-3.5">
                    {/* Budget Range Box */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900/90 p-3 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between shadow-2xs">
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Budget Range</span>
                      <span className="text-sm font-extrabold text-primary dark:text-teal-300">
                        ₹{p.budget_min.toLocaleString("en-IN")} – ₹{p.budget_max.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/mo</span>
                      </span>
                    </div>

                    {/* Lifestyle Tags */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider block">
                        Habits & Preferences
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.lifestyle_tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/90 hover:border-primary/40 dark:hover:border-teal-400/50 transition-colors shadow-2xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/70">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Demo Campus</span>
                  <Button
                    size="sm"
                    variant={isMe ? "secondary" : "default"}
                    onClick={() => handleContactRoommate(p)}
                    className={
                      isMe 
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold" 
                        : "bg-primary dark:bg-teal-600 hover:dark:bg-teal-500 text-white font-bold shadow-xs"
                    }
                  >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    {isMe ? "My Profile" : "Message"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
