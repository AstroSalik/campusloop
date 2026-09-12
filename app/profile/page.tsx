"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Building2, 
  Check, 
  CreditCard,
  Edit3, 
  ExternalLink, 
  FileText,
  GraduationCap,
  Home, 
  Lock,
  LogOut, 
  Mail, 
  Package, 
  Phone,
  Plus, 
  Receipt,
  ShieldAlert,
  ShieldCheck, 
  Sparkles, 
  Store, 
  Tag, 
  Trash2, 
  UserCheck, 
  Users, 
  Wallet 
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DEMO_USERS, 
  DemoUser, 
  getClientDemoSession, 
  setClientDemoSession, 
  clearClientDemoSession 
} from "@/lib/auth";
import { getListings, fetchListingsFromSupabase, deleteListing } from "@/lib/marketplace-data";
import { getRooms, fetchRoomsFromSupabase, deleteRoom } from "@/lib/housing-data";
import { getTransactionsByUserId, PaymentTransaction } from "@/lib/razorpay-service";
import { PaymentReceiptDialog } from "@/components/payments/PaymentReceiptDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { EditListingDialog } from "@/components/marketplace/EditListingDialog";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { KycVerificationDialog } from "@/components/profile/KycVerificationDialog";
import { createClient } from "@/lib/supabase/client";
import { AuthRequiredGuard } from "@/components/auth/AuthRequiredGuard";

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(() => getClientDemoSession());
  const [myListings, setMyListings] = useState<ReturnType<typeof getListings>>([]);
  const [myRooms, setMyRooms] = useState<ReturnType<typeof getRooms>>([]);
  const [myTransactions, setMyTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isKycOpen, setIsKycOpen] = useState(false);

  const loadUserData = async (user: DemoUser) => {
    const allListings = getListings();
    const allRooms = getRooms();
    const txs = getTransactionsByUserId(user.id);
    setMyListings(allListings.filter((l) => l.seller_id === user.id));
    setMyRooms(allRooms.filter((r) => r.owner_id === user.id));
    setMyTransactions(txs);

    try {
      const [cloudListings, cloudRooms] = await Promise.all([
        fetchListingsFromSupabase(),
        fetchRoomsFromSupabase(),
      ]);
      setMyListings(cloudListings.filter((l) => l.seller_id === user.id));
      setMyRooms(cloudRooms.filter((r) => r.owner_id === user.id));
    } catch (e) {}
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const clientSession = getClientDemoSession();
          let cloudIncome: number | undefined = undefined;
          let cloudName: string | undefined = undefined;
          let cloudAvatar: string | undefined = undefined;
          let cloudCampusName: string | undefined = undefined;
          let cloudCity: string | undefined = undefined;
          let cloudDept: string | undefined = undefined;
          let cloudYear: string | undefined = undefined;
          let cloudPhone: string | undefined = undefined;
          let cloudVerification: "unverified" | "pending" | "verified" | undefined = undefined;
          let cloudAadhaarLast4: string | undefined = undefined;

          try {
            const { data: dbUser } = await supabase
              .from("users")
              .select("monthly_income, name, email, avatar, campus_id, campus_name, city, department, year_of_study, phone, verification_status, aadhaar_last4")
              .eq("id", user.id)
              .maybeSingle();

            if (dbUser) {
              if (dbUser.monthly_income != null) cloudIncome = Number(dbUser.monthly_income);
              if (dbUser.name) cloudName = dbUser.name;
              if (dbUser.avatar) cloudAvatar = dbUser.avatar;
              if (dbUser.campus_name) cloudCampusName = dbUser.campus_name;
              if (dbUser.city) cloudCity = dbUser.city;
              if (dbUser.department) cloudDept = dbUser.department;
              if (dbUser.year_of_study) cloudYear = dbUser.year_of_study;
              if (dbUser.phone) cloudPhone = dbUser.phone;
              if (dbUser.verification_status) cloudVerification = dbUser.verification_status as any;
              if (dbUser.aadhaar_last4) cloudAadhaarLast4 = dbUser.aadhaar_last4;
            }
          } catch (e) {}

          const resolvedIncome = cloudIncome != null 
            ? cloudIncome 
            : (clientSession?.monthly_income != null ? clientSession.monthly_income : 15000);

          const resolvedCampusName = cloudCampusName 
            || user.user_metadata?.campus_name 
            || clientSession?.campus_name 
            || "Lovely Professional University (LPU)";

          const resolvedCity = cloudCity 
            || user.user_metadata?.city 
            || clientSession?.city 
            || "Phagwara, Punjab";

          const resolvedDept = cloudDept 
            || user.user_metadata?.department 
            || clientSession?.department;

          const resolvedYear = cloudYear 
            || user.user_metadata?.year_of_study 
            || clientSession?.year_of_study;

          const resolvedPhone = cloudPhone 
            || user.user_metadata?.phone 
            || clientSession?.phone;

          const resolvedVerification = cloudVerification 
            || user.user_metadata?.verification_status 
            || clientSession?.verification_status 
            || "unverified";

          const resolvedAadhaarLast4 = cloudAadhaarLast4 
            || user.user_metadata?.aadhaar_last4 
            || clientSession?.aadhaar_last4;

          const activeUser: DemoUser = {
            id: user.id,
            name: cloudName || clientSession?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Student",
            email: user.email || clientSession?.email || "",
            campus_id: clientSession?.campus_id || "00000000-0000-0000-0000-000000000001",
            campus_name: resolvedCampusName,
            city: resolvedCity,
            department: resolvedDept,
            year_of_study: resolvedYear,
            phone: resolvedPhone,
            verification_status: resolvedVerification,
            aadhaar_last4: resolvedAadhaarLast4,
            monthly_income: resolvedIncome,
            avatar: cloudAvatar || clientSession?.avatar || user.user_metadata?.avatar || null,
            initials: (cloudName || clientSession?.name || user.user_metadata?.full_name || user.email || "S")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase(),
            role_desc: clientSession?.role_desc || "Student Account",
          };
          setClientDemoSession(activeUser);
          setCurrentUser(activeUser);
          loadUserData(activeUser);
          return;
        }
      } catch (err) {}

      const fallback = getClientDemoSession();
      if (fallback) {
        setCurrentUser(fallback);
        loadUserData(fallback);
      } else {
        router.push("/login?redirect=/profile");
      }
    };

    fetchUser();
  }, [router]);


  const handleSignOut = async () => {
    try {
      // 1. Terminate server-side session and invalidate auth cookies
      await fetch("/api/auth/signout", { method: "POST" });
      // 2. Clear browser Supabase auth state
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out warning:", err);
    }
    // 3. Clear local storage demo session and notify listeners
    clearClientDemoSession();
    toast.info("Signed out securely from session.");
    router.push("/login");
    router.refresh();
  };

  const handleDeleteListing = (id: string, title: string) => {
    deleteListing(id);
    setMyListings((prev) => prev.filter((item) => item.id !== id));
    toast.success(`Deleted listing: "${title}"`);
  };

  const handleDeleteRoom = (id: string, title: string) => {
    deleteRoom(id);
    setMyRooms((prev) => prev.filter((room) => room.id !== id));
    toast.success(`Deleted room accommodation: "${title}"`);
  };

  if (!currentUser) {
    return (
      <AuthRequiredGuard
        title="Student Sign In Required"
        featureName="Student Profile & Settings"
        description="To view your profile, manage active listings, check accommodations, and update allowance budgets, please sign in with your student account."
        redirectUrl="/profile"
        backUrl="/"
        backLabel="Back to Home"
      />
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Top Profile Header Card */}
      <Card className="border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-slate-50 to-primary/5 dark:from-teal-950/50 dark:via-slate-800 dark:to-slate-800 p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 min-w-[64px] max-w-[64px] min-h-[64px] max-h-[64px] border-2 border-white dark:border-teal-400/40 shadow-sm shrink-0 rounded-full overflow-hidden">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  width={64}
                  height={64}
                  className="aspect-square w-full h-full max-w-full max-h-full object-cover rounded-full select-none block"
                  style={{
                    width: "64px",
                    height: "64px",
                    maxWidth: "64px",
                    maxHeight: "64px",
                    objectFit: "cover"
                  }}
                />
              ) : (
                <AvatarFallback className="bg-primary dark:bg-teal-950 text-white dark:text-teal-300 text-xl font-extrabold">
                  {currentUser.initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {currentUser.name}
                </h1>
                <Badge variant="outline" className="bg-white dark:bg-slate-900 text-primary dark:text-teal-300 border-primary/30 dark:border-teal-500/40 text-xs font-bold">
                  {currentUser.role_desc}
                </Badge>
                {currentUser.verification_status === "verified" ? (
                  <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 text-[10px] gap-1 font-bold">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    Verified Student
                  </Badge>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsKycOpen(true)}
                    title="Click to verify your profile with Aadhaar KYC"
                    className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 transition-all shadow-xs group"
                  >
                    <ShieldAlert className="h-3 w-3 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Verify Profile (Aadhaar KYC)</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary dark:text-teal-400" />
                <span>{currentUser.email}</span>
                <span>•</span>
                <Building2 className="h-3.5 w-3.5 text-primary dark:text-teal-400" />
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {currentUser.campus_name || "Lovely Professional University (LPU)"}
                </span>
                {currentUser.city && (
                  <span className="text-slate-500 dark:text-slate-400">({currentUser.city})</span>
                )}
                {currentUser.department && (
                  <>
                    <span>•</span>
                    <GraduationCap className="h-3.5 w-3.5 text-primary dark:text-teal-400" />
                    <span>{currentUser.department}</span>
                  </>
                )}
                {currentUser.year_of_study && (
                  <>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-400">{currentUser.year_of_study}</span>
                  </>
                )}
                {currentUser.phone && (
                  <>
                    <span>•</span>
                    <Phone className="h-3.5 w-3.5 text-primary dark:text-teal-400" />
                    <span>{currentUser.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
              className="text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-teal-300 gap-1.5 font-semibold"
            >
              <Edit3 className="h-3.5 w-3.5 text-primary dark:text-teal-400" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 gap-1.5 font-medium"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Actionable Prompt Card for Unverified Users */}
        {currentUser.verification_status !== "verified" && (
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/50 dark:via-slate-850 dark:to-transparent border-t border-amber-200/60 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Aadhaar Student KYC Verification Required
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-bold text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 py-0 px-1.5">
                    Not Verified
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  Verify your student identity using your 12-digit Aadhaar card to unlock the verified badge across all marketplace listings, roommate posts, and rent agreements.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setIsKycOpen(true)}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 h-8 shadow-xs"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Verify with Aadhaar
            </Button>
          </div>
        )}

        {/* Quick Allowance Summary */}
        <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-800/60">
          <div 
            onClick={() => setIsEditingProfile(true)}
            className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/90 p-3.5 shadow-2xs hover:border-primary/40 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Monthly Allowance</span>
              <Edit3 className="h-3 w-3 text-slate-400 group-hover:text-primary dark:group-hover:text-teal-300 transition-colors" />
            </div>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {currentUser.monthly_income ? `₹${currentUser.monthly_income.toLocaleString("en-IN")}` : "Not Set"}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {currentUser.monthly_income ? "Click to update budget" : "Click to set up allowance"}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/90 p-3.5 shadow-2xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Active Items Listed</span>
            <span className="text-base font-extrabold text-primary dark:text-teal-300">{myListings.length}</span>
          </div>
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/90 p-3.5 col-span-2 sm:col-span-1 shadow-2xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Rooms Managed</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{myRooms.length}</span>
          </div>
        </div>
      </Card>

      {/* Tabs: My Listings, My Rooms, Payments */}
      <Tabs defaultValue="listings" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <TabsTrigger value="listings" className="text-[11px] sm:text-xs font-bold px-1 sm:px-3 gap-1 sm:gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary dark:data-[state=active]:text-teal-300 text-slate-600 dark:text-slate-400">
            <Package className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Listings ({myListings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="text-[11px] sm:text-xs font-bold px-1 sm:px-3 gap-1 sm:gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary dark:data-[state=active]:text-teal-300 text-slate-600 dark:text-slate-400">
            <Home className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Rooms ({myRooms.length})</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-[11px] sm:text-xs font-bold px-1 sm:px-3 gap-1 sm:gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary dark:data-[state=active]:text-teal-300 text-slate-600 dark:text-slate-400">
            <Receipt className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Payments ({myTransactions.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: My Marketplace Listings */}
        <TabsContent value="listings" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Items You Posted for Sale/Rent
            </h3>
            <Button asChild size="sm" className="h-8 text-xs gap-1 font-semibold">
              <Link href="/marketplace/new">
                <Plus className="h-3.5 w-3.5" />
                Post Item
              </Link>
            </Button>
          </div>

          {myListings.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No active marketplace listings"
              description="You haven't listed any items for sale or rent yet."
              actionLabel="Post Your First Listing"
              onAction={() => router.push("/marketplace/new")}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myListings.map((item) => (
                <Card key={item.id} className="border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-800/95 shadow-2xs flex flex-col justify-between overflow-hidden">
                  <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="text-[10px] mb-1 capitalize bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-teal-300 border-slate-200 dark:border-slate-700">
                          {item.category} • {item.type}
                        </Badge>
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.title}
                        </CardTitle>
                      </div>
                      <span className="text-sm font-extrabold text-primary dark:text-teal-300 shrink-0">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2.5 pb-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {item.description}
                  </CardContent>
                  <CardFooter className="p-3 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between">
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-primary dark:text-teal-300 gap-1 font-semibold">
                      <Link href={`/marketplace/${item.id}`}>
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Link>
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingListing(item)}
                        className="h-7 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1 font-semibold"
                      >
                        <Edit3 className="h-3 w-3 text-primary dark:text-teal-400" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteListing(item.id, item.title)}
                        className="h-7 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1 font-semibold"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: My Rooms */}
        <TabsContent value="rooms" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Accommodations You Posted
            </h3>
            <Button asChild size="sm" className="h-8 text-xs gap-1 font-semibold">
              <Link href="/housing/new">
                <Plus className="h-3.5 w-3.5" />
                List Room
              </Link>
            </Button>
          </div>

          {myRooms.length === 0 ? (
            <EmptyState
              icon={Home}
              title="No posted accommodations"
              description="You haven't listed any flats or rooms yet."
              actionLabel="List a Room"
              onAction={() => router.push("/housing/new")}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myRooms.map((room) => (
                <Card key={room.id} className="border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-800/95 shadow-2xs flex flex-col justify-between overflow-hidden">
                  <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="text-[10px] mb-1 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-teal-300 border-slate-200 dark:border-slate-700">
                          {room.bedrooms} BHK • {room.location_label}
                        </Badge>
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {room.title}
                        </CardTitle>
                      </div>
                      <span className="text-sm font-extrabold text-primary dark:text-teal-300 shrink-0">
                        ₹{room.rent.toLocaleString("en-IN")}/mo
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2.5 pb-3 text-xs text-slate-600 dark:text-slate-300">
                    Capacity: <strong className="text-slate-900 dark:text-white">{room.occupancy_total} flatmates</strong> • Available: <strong className="text-slate-900 dark:text-white">{room.available_from}</strong>
                  </CardContent>
                  <CardFooter className="p-3 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between">
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-primary dark:text-teal-300 gap-1 font-semibold">
                      <Link href={`/housing/${room.id}`}>
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRoom(room.id, room.title)}
                      className="h-7 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1 font-semibold"
                    >
                      <Trash2 className="h-3 w-3" />
                      Archive
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Payments & Digital Receipts */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-primary" />
                Verified Digital Payment Receipts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Razorpay test transactions for your housing bookings, marketplace purchases, and rent shares.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1">
              <Link href="/payments">
                Open Full Ledger
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          {myTransactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="When you book rooms, buy marketplace items, or pay rent shares, digital receipts will appear here."
              actionLabel="Browse Marketplace"
              onAction={() => router.push("/marketplace")}
            />
          ) : (
            <div className="space-y-3">
              {myTransactions.map((tx) => (
                <Card
                  key={tx.id}
                  className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden"
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type === "housing_booking"
                            ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300"
                            : tx.type === "marketplace_purchase"
                            ? "bg-blue-50 dark:bg-blue-950/60 text-[#3395ff]"
                            : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {tx.type === "housing_booking" ? (
                          <Building2 className="h-4 w-4" />
                        ) : tx.type === "marketplace_purchase" ? (
                          <Package className="h-4 w-4" />
                        ) : (
                          <Receipt className="h-4 w-4" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {tx.item_title}
                          </p>
                          <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0 font-bold">
                            {tx.type_label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono text-[11px]">{tx.id}</span>
                          <span>•</span>
                          <span>{new Date(tx.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                          {tx.pickup_otp && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">OTP: {tx.pickup_otp}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        ₹{tx.amount.toLocaleString("en-IN")}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTx(tx);
                          setIsReceiptOpen(true);
                        }}
                        className="h-7 text-xs font-semibold gap-1"
                      >
                        <FileText className="h-3 w-3 text-primary" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Listing Modal */}
      {editingListing && (
        <EditListingDialog
          listing={editingListing}
          open={!!editingListing}
          onOpenChange={(open) => {
            if (!open) setEditingListing(null);
          }}
          onUpdated={() => {
            loadUserData(currentUser);
            setEditingListing(null);
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {currentUser && isEditingProfile && (
        <EditProfileDialog
          key={`${currentUser.id}-${currentUser.name}-${currentUser.avatar || "no-avatar"}`}
          user={currentUser}
          open={isEditingProfile}
          onOpenChange={setIsEditingProfile}
          onRequestKyc={() => setIsKycOpen(true)}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
          }}
        />
      )}

      {/* Aadhaar KYC Verification Modal */}
      {currentUser && isKycOpen && (
        <KycVerificationDialog
          user={currentUser}
          open={isKycOpen}
          onOpenChange={setIsKycOpen}
          onVerified={(updated) => {
            setCurrentUser(updated);
          }}
        />
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
