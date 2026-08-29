"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  AlertCircle,
  AlertTriangle,
  ArrowLeft, 
  Bed, 
  Bell,
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock,
  DollarSign, 
  Flame,
  Home, 
  Info,
  Lock,
  Mail, 
  MapPin, 
  MessageSquare, 
  Percent, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Tag,
  Trash2,
  UserCheck, 
  UserPlus,
  Users, 
  X,
  Zap
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
  getRoomById, 
  markUserInterested, 
  withdrawUserInterest, 
  bookRoomSpot, 
  cancelRoomBooking,
  filterActiveInterests
} from "@/lib/housing-data";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";
import { getOrCreateRoomConversation } from "@/lib/conversations";
import { calculateSplit, evaluateRentHealth } from "@/lib/rent-engine";

export default function RoomDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;
  const [room, setRoom] = useState<ReturnType<typeof getRoomById> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const refreshRoom = () => {
    const item = getRoomById(params.id);
    setRoom(item || null);
  };

  useEffect(() => {
    refreshRoom();
    setLoading(false);

    const handleUpdate = () => refreshRoom();
    window.addEventListener("campusloop_housing_updated", handleUpdate);
    return () => window.removeEventListener("campusloop_housing_updated", handleUpdate);
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          <Building2 className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Room Listing Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This accommodation listing may have been filled or archived.
        </p>
        <Button asChild>
          <Link href="/housing">Browse Housing</Link>
        </Button>
      </div>
    );
  }

  const isOwner = room.owner_id === currentUser.id;
  const activeInterests = filterActiveInterests(room.interested_users);
  const bookedUsers = room.booked_users || [];
  const spotsLeft = room.occupancy_total - bookedUsers.length;
  const isFull = spotsLeft <= 0;

  // Check current user status
  const userBooking = bookedUsers.find((b) => b.user_id === currentUser.id);
  const isBookedByMe = Boolean(userBooking);
  const userInterest = activeInterests.find((i) => i.user_id === currentUser.id);
  const isInterestedByMe = Boolean(userInterest);

  // Time remaining calculation for user's interest (7-day window)
  let interestDaysLeft = 0;
  let interestHoursLeft = 0;
  if (userInterest) {
    const msLeft = Math.max(0, new Date(userInterest.expires_at).getTime() - Date.now());
    interestDaysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
    interestHoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  }

  const perPersonShare = calculateSplit(room.rent, room.utilities, room.maintenance, room.occupancy_total);
  const totalMonthly = room.rent + room.utilities + room.maintenance;

  // Rent health assessment against current user's monthly allowance
  const rentHealth = evaluateRentHealth(
    room.rent,
    room.utilities,
    room.maintenance,
    room.occupancy_total,
    currentUser.monthly_income || 15000
  );

  // Handler: Express Interest / Join Group Chat
  const handleExpressInterest = async () => {
    if (isOwner) {
      toast.info("You posted this accommodation!");
      return;
    }

    setProcessing(true);
    try {
      // 1. Mark interest in database with 7-day expiration timer
      const res = markUserInterested(room.id, {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        initials: currentUser.initials,
      });

      // 2. Open / Join Roommate Group Conversation
      const conversationId = await getOrCreateRoomConversation(
        room.id,
        currentUser.id,
        room.owner_id
      );

      toast.success(res.message);
      refreshRoom();
      router.push(`/messages/${conversationId}`);
    } catch (err) {
      toast.error("Could not process request. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Handler: Withdraw Interest
  const handleWithdrawInterest = () => {
    withdrawUserInterest(room.id, currentUser.id);
    toast.info("You withdrew your interest from this accommodation.");
    refreshRoom();
  };

  // Handler: Confirm Official Booking
  const handleConfirmBooking = () => {
    setProcessing(true);
    const res = bookRoomSpot(room.id, {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      initials: currentUser.initials,
    });

    if (res.success) {
      toast.success(res.message);
      setIsBookingOpen(false);
      refreshRoom();
    } else {
      toast.error(res.message);
    }
    setProcessing(false);
  };

  // Handler: Cancel Booking
  const handleCancelBooking = () => {
    const res = cancelRoomBooking(room.id, currentUser.id);
    if (res.success) {
      toast.info(res.message);
      refreshRoom();
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-2">
          <Link href="/housing">
            <ArrowLeft className="h-4 w-4" />
            Back to Housing Listings
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          onClick={() => {
            navigator.clipboard?.writeText?.(window.location.href);
            toast.success("Housing link copied to clipboard!");
          }}
        >
          <Share2 className="mr-1.5 h-3.5 w-3.5" />
          Share
        </Button>
      </div>

      {/* Dynamic User Alert Banners (Interest Reminder / Booking Confirmation) */}
      {isBookedByMe && (
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                  Spot #{userBooking?.spot_number} Officially Booked!
                </h3>
                <Badge className="bg-emerald-600 text-white text-[10px]">Confirmed</Badge>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                You booked this spot on {new Date(userBooking?.booked_at || "").toLocaleDateString("en-IN")}. Your share is ₹{perPersonShare.toLocaleString("en-IN")}/mo.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelBooking}
            className="border-emerald-300 dark:border-emerald-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 text-xs shrink-0 self-end sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Cancel Booking
          </Button>
        </div>
      )}

      {isInterestedByMe && !isBookedByMe && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Clock className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-amber-950 dark:text-amber-100">
                  Priority Interest Active • 1-Week Time Limit
                </h3>
                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border-amber-300 text-[10px]">
                  ⏳ {interestDaysLeft}d {interestHoursLeft}h Remaining
                </Badge>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                You expressed interest in this flat. Lock in your spot now before your 7-day reservation expires and spot is released!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleWithdrawInterest}
              className="text-xs border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100/60"
            >
              Withdraw Interest
            </Button>
            <Button
              size="sm"
              onClick={() => setIsBookingOpen(true)}
              disabled={isFull}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
            >
              <Zap className="h-3.5 w-3.5 mr-1" />
              ⚡ Book Spot Now
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details, Live Spot Itinerary, and Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Banner with Room Photo */}
          <div className="relative h-64 sm:h-80 w-full rounded-2xl bg-gradient-to-br from-primary/10 via-slate-50 dark:via-slate-900/80 to-primary/5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {room.images && room.images.length > 0 ? (
              <>
                <img
                  src={room.images[0].image_url}
                  alt={room.title}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/30" />
                <div className="relative z-10 space-y-1 text-white">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                    {room.title}
                  </h2>
                  <p className="text-sm font-medium text-slate-200 flex items-center justify-center gap-1.5 drop-shadow-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    {room.location_label} • Available from {room.available_from}
                  </p>
                </div>
              </>
            ) : (
              <div className="relative z-10">
                <Building2 className="h-16 w-16 text-primary/70 dark:text-teal-400/80 mb-3 mx-auto" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {room.title}
                </h2>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 flex items-center justify-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary dark:text-teal-400" />
                  {room.location_label} • Available from {room.available_from}
                </p>
              </div>
            )}

            <div className="absolute top-4 left-4 z-20">
              <Badge className="bg-primary text-white shadow-xs">
                {room.bedrooms} BHK Unit
              </Badge>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              {activeInterests.length > 0 && !isFull && (
                <Badge variant="outline" className="bg-orange-500/90 backdrop-blur text-white border-transparent shadow-xs font-semibold">
                  <Flame className="h-3 w-3 mr-1 text-amber-200 fill-amber-200" />
                  {activeInterests.length} Interested
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`shadow-xs font-semibold ${
                  isFull
                    ? "bg-red-600/90 text-white border-transparent"
                    : "bg-white/95 dark:bg-slate-800/95 backdrop-blur border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                }`}
              >
                <Users className="h-3 w-3 mr-1 inline-block" />
                {isFull ? "Fully Occupied" : `${spotsLeft} of ${room.occupancy_total} Spot(s) Open`}
              </Badge>
            </div>
          </div>

          {/* Section 1: Spot Allocation & Itinerary */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary dark:text-teal-400" />
                    Spot Allocation & Itinerary ({bookedUsers.length}/{room.occupancy_total} Filled)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time status of each slot in this {room.occupancy_total}-person flat.
                  </CardDescription>
                </div>
                <Badge variant={isFull ? "destructive" : "outline"} className="text-xs">
                  {spotsLeft} Spot{spotsLeft !== 1 ? "s" : ""} Available
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: room.occupancy_total }).map((_, idx) => {
                  const spotNum = idx + 1;
                  const booking = bookedUsers.find((b) => b.spot_number === spotNum) || bookedUsers[idx];
                  const isThisMe = booking && booking.user_id === currentUser.id;

                  if (booking) {
                    return (
                      <div
                        key={spotNum}
                        className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-10 w-10 border-2 border-emerald-500 shrink-0">
                            <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                              {booking.user_initials || booking.user_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                Spot #{spotNum}
                              </span>
                              {isThisMe && (
                                <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0">You</Badge>
                              )}
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {booking.user_name}
                            </p>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              Booked on {new Date(booking.booked_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-emerald-600 text-white text-[10px] shrink-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Booked
                        </Badge>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={spotNum}
                      className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 p-3.5 flex items-center justify-between gap-3 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold text-xs border border-slate-200 dark:border-slate-700">
                          #{spotNum}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Spot #{spotNum}
                          </span>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Open & Available
                          </p>
                          <span className="text-[10px] text-slate-400 block">
                            ₹{perPersonShare.toLocaleString("en-IN")}/mo split
                          </span>
                        </div>
                      </div>

                      {!isOwner && !isBookedByMe && (
                        <Button
                          size="sm"
                          onClick={() => setIsBookingOpen(true)}
                          className="bg-primary hover:bg-primary/90 text-white text-xs h-8 px-3 shadow-2xs font-semibold"
                        >
                          Book Slot
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Active Interested Students (7-Day Expiry Window) */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Interested Students ({activeInterests.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Prospective flatmates with an active 1-week reservation window.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                  7-Day Auto Expiry
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3">
              {activeInterests.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No other students currently in the interest queue. Be the first to express interest!
                </div>
              ) : (
                <div className="space-y-2">
                  {activeInterests.map((interest) => {
                    const isMe = interest.user_id === currentUser.id;
                    const msLeft = Math.max(0, new Date(interest.expires_at).getTime() - Date.now());
                    const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
                    const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                    return (
                      <div
                        key={interest.user_id}
                        className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${
                          isMe
                            ? "border-amber-300 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/30"
                            : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 shrink-0">
                            <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300 text-xs font-bold">
                              {interest.user_initials || interest.user_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {interest.user_name}
                              </p>
                              {isMe && (
                                <Badge className="bg-amber-600 text-white text-[9px] px-1 py-0">You</Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              Interested on {new Date(interest.interested_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Clock className="h-3 w-3 mr-1 text-amber-500" />
                            {daysLeft}d {hoursLeft}h left to book
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Policy:</strong> When a student marks interest, they have 7 days to finalize and book. If not booked within that week, they are automatically removed so open spots reflect accurately.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Cost Breakdown */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Transparent Cost Breakdown
                </CardTitle>
                <Badge variant={rentHealth.flag}>
                  {rentHealth.flagEmoji} {rentHealth.flagLabel} ({rentHealth.housingRatioPct}%)
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Split equally among {room.occupancy_total} flatmates.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/70 p-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Base Rent</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">₹{room.rent.toLocaleString("en-IN")}</span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/70 p-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Utilities</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">₹{room.utilities.toLocaleString("en-IN")}</span>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/70 p-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Maintenance</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">₹{room.maintenance.toLocaleString("en-IN")}</span>
                </div>
                <div className="rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 p-3">
                  <span className="text-xs text-primary dark:text-teal-300 font-semibold block">Your Share</span>
                  <span className="text-base font-extrabold text-primary dark:text-teal-300">₹{perPersonShare.toLocaleString("en-IN")}/mo</span>
                </div>
              </div>

              {/* Deep Link to Rent Health Calculator */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/40 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Percent className="h-4 w-4 text-primary dark:text-teal-400" />
                    Rent Health Affordability Assessment
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Takes {rentHealth.housingRatioPct}% of your monthly allowance (₹{currentUser.monthly_income?.toLocaleString("en-IN")}).
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <Link href={`/rent?room=${room.id}`}>
                    Launch Calculator
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Amenities */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Included Amenities & Facilities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {amenity}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Booking CTA Sidebar & Lister Info */}
        <div className="space-y-6">
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm sticky top-20">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Per-Person Split</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  ₹{perPersonShare.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ mo</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Total ₹{totalMonthly.toLocaleString("en-IN")} split {room.occupancy_total} ways
              </p>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Primary Action Buttons */}
              {isOwner ? (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3.5 text-center text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  You posted this accommodation. Check your Messages tab for prospective roommates.
                </div>
              ) : isBookedByMe ? (
                <div className="space-y-2">
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/70 p-3 text-center text-xs font-bold text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                    ✓ You have booked Spot #{userBooking?.spot_number}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-slate-200 dark:border-slate-700"
                    onClick={handleCancelBooking}
                  >
                    Cancel My Booking
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Direct Book Spot Button */}
                  <Button
                    className="w-full h-11 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    onClick={() => setIsBookingOpen(true)}
                    disabled={isFull || processing}
                  >
                    <Zap className="mr-1.5 h-4 w-4" />
                    {isFull ? "Fully Booked" : `Book Spot (#${bookedUsers.length + 1})`}
                  </Button>

                  {/* Express Interest / Join Group Chat */}
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={handleExpressInterest}
                    disabled={processing}
                  >
                    <MessageSquare className="mr-1.5 h-4 w-4 text-primary dark:text-teal-400" />
                    {isInterestedByMe ? "Open Roommate Group Chat" : "I'm Interested / Join Chat"}
                  </Button>
                </div>
              )}

              {/* Policy & Auto Chat Info */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <Sparkles className="h-3.5 w-3.5 text-primary dark:text-teal-400" />
                  Booking & Interest Rules
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  • <strong>Booking:</strong> Instantly claims your slot in the itinerary.<br/>
                  • <strong>Interest:</strong> Places you in the 7-day queue and group discussion thread.
                </p>
              </div>

              {/* Owner Info Card */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Accommodation Lister
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border border-slate-200 dark:border-slate-700">
                    <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300 font-bold text-sm">
                      {room.owner_initials || room.owner_name?.[0] || "O"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{room.owner_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {room.owner_email}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Official Booking Confirmation Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-600" />
              Confirm Room Booking
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Review your spot allocation and split breakdown before confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 p-3.5 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-800 dark:text-emerald-300 font-semibold">Allocated Slot</span>
                <Badge className="bg-emerald-600 text-white font-bold text-xs">
                  Spot #{bookedUsers.length + 1}
                </Badge>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{room.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{room.location_label}</p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Monthly Rent Share:</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{Math.round(room.rent / room.occupancy_total).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Est. Utilities + Maintenance:</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{Math.round((room.utilities + room.maintenance) / room.occupancy_total).toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Your Total Monthly Share:</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{perPersonShare.toLocaleString("en-IN")}/mo</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
              👤 Booking under: <strong>{currentUser.name}</strong> ({currentUser.email}). Your name and avatar will reflect in the itinerary immediately.
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBookingOpen(false)}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={processing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {processing ? "Booking..." : "Confirm & Lock My Spot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
