"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Bike, 
  BookOpen, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Edit3, 
  Home, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Package, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Tag, 
  Trash2, 
  UserCheck, 
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
import { getListingById, deleteListing, updateListing } from "@/lib/marketplace-data";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";
import { getOrCreateMarketplaceConversation } from "@/lib/conversations";
import { EditListingDialog } from "@/components/marketplace/EditListingDialog";
import { RazorpayCheckoutModal } from "@/components/payments/RazorpayCheckoutModal";
import { PaymentReceiptDialog } from "@/components/payments/PaymentReceiptDialog";
import { PaymentTransaction } from "@/lib/razorpay-service";

export default function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;
  const [listing, setListing] = useState<ReturnType<typeof getListingById> | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState<PaymentTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const refreshListing = () => {
    const item = getListingById(params.id);
    setListing(item || null);
  };

  useEffect(() => {
    refreshListing();
    setLoading(false);
  }, [params.id]);

  const handleDeleteListing = () => {
    if (!listing) return;
    const confirmed = window.confirm(`Are you sure you want to delete "${listing.title}"? This cannot be undone.`);
    if (confirmed) {
      deleteListing(listing.id);
      toast.success("Listing deleted successfully.");
      router.push("/marketplace");
    }
  };

  const handleMessageSeller = async () => {
    if (!listing) return;

    if (listing.seller_id === currentUser.id) {
      toast.info("This is your own listing!");
      return;
    }

    setContacting(true);
    try {
      // PRD Flow A: Unified Conversation Auto-Creation
      const conversationId = await getOrCreateMarketplaceConversation(
        listing.id,
        currentUser.id,
        listing.seller_id
      );

      toast.success(`Connected with ${listing.seller_name}! Opening conversation...`);
      router.push(`/messages/${conversationId}`);
    } catch (err) {
      toast.error("Could not start conversation. Please try again.");
    } finally {
      setContacting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "cycles":
        return <Bike className="h-16 w-16 text-primary/40" />;
      case "books":
        return <BookOpen className="h-16 w-16 text-primary/40" />;
      case "electronics":
        return <Cpu className="h-16 w-16 text-primary/40" />;
      case "appliances":
        return <Zap className="h-16 w-16 text-primary/40" />;
      case "furniture":
        return <Home className="h-16 w-16 text-primary/40" />;
      default:
        return <Package className="h-16 w-16 text-primary/40" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="h-80 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-sm text-slate-500">
          This item may have been sold or archived by the seller.
        </p>
        <Button asChild>
          <Link href="/marketplace">Browse Marketplace</Link>
        </Button>
      </div>
    );
  }

  const isOwner = listing.seller_id === currentUser.id;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-6">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-900 -ml-2">
          <Link href="/marketplace">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="gap-1.5 text-slate-700"
              >
                <Edit3 className="h-3.5 w-3.5 text-primary" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteListing}
                className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard?.writeText?.(window.location.href);
              toast.success("Listing link copied to clipboard!");
            }}
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Images & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Visual / Image Hero */}
          <div className="relative h-72 sm:h-96 w-full rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden">
            {listing.images && listing.images.length > 0 && !imageError ? (
              <img
                src={listing.images[0].image_url}
                alt={listing.title}
                onError={() => setImageError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 text-center p-6 bg-slate-50/60 w-full h-full">
                {getCategoryIcon(listing.category)}
                <span className="text-base font-bold text-slate-800">
                  {listing.title}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {listing.category} • {listing.location_label}
                </span>
                <span className="text-[11px] text-slate-400">
                  Verified campus student listing
                </span>
              </div>
            )}

            <div className="absolute top-4 left-4 flex gap-2">
              <Badge
                className={`text-xs uppercase font-bold tracking-wider px-3 py-1 shadow-xs ${
                  listing.type === "rent"
                    ? "bg-amber-600"
                    : listing.type === "buy"
                    ? "bg-teal-700"
                    : "bg-primary"
                }`}
              >
                {listing.type === "rent" ? "For Rent" : listing.type === "buy" ? "Wanted" : "For Sale"}
              </Badge>
              <Badge variant="secondary" className="bg-white/90 backdrop-blur text-slate-800 border-slate-200">
                {listing.condition}
              </Badge>
            </div>
          </div>

          {/* Description Section */}
          <Card className="border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>Pickup at <strong>{listing.location_label}</strong></span>
                <span>•</span>
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Posted {new Date(listing.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                {listing.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-slate-50/70 p-4 border border-slate-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Item Description
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Key Specs Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-lg border border-slate-200 p-2.5">
                  <span className="text-[11px] text-slate-400 block">Category</span>
                  <span className="text-sm font-semibold text-slate-800">{listing.category}</span>
                </div>
                <div className="rounded-lg border border-slate-200 p-2.5">
                  <span className="text-[11px] text-slate-400 block">Condition</span>
                  <span className="text-sm font-semibold text-slate-800">{listing.condition}</span>
                </div>
                <div className="rounded-lg border border-slate-200 p-2.5 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400 block">Listing Status</span>
                  <span className="text-sm font-semibold text-emerald-600 capitalize">{listing.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Price & Seller Action Card */}
        <div className="space-y-6">
          {/* Price & Primary CTA */}
          <Card className="border-slate-200/80 bg-white shadow-sm sticky top-20">
            <CardHeader className="pb-4">
              <span className="text-xs font-medium text-slate-500">Fixed Asking Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{listing.price.toLocaleString("en-IN")}
                </span>
                {listing.type === "rent" && (
                  <span className="text-sm font-normal text-slate-500">/ month</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Message Seller / Interested CTA (PRD Flow A) vs Owner Management */}
              {isOwner ? (
                <div className="space-y-2.5">
                  <div className="rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800 p-2.5 text-center text-xs text-teal-800 dark:text-teal-200 font-medium">
                    You are the seller of this listing.
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-10 font-semibold gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit3 className="h-4 w-4 text-primary" />
                    Edit Listing Details
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full h-10 font-semibold gap-2 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDeleteListing}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Listing
                  </Button>
                </div>
              ) : listing.status === "sold" ? (
                <div className="space-y-2.5">
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 text-center">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                      Item Sold
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      This item has already been purchased and reserved for pickup.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-10 text-sm font-semibold"
                    onClick={handleMessageSeller}
                    disabled={contacting}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {contacting ? "Connecting..." : "Message Seller"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <Button
                    className="w-full h-11 text-base font-semibold bg-[#3395ff] hover:bg-[#287bd5] text-white shadow-xs"
                    onClick={() => setIsRazorpayModalOpen(true)}
                  >
                    Buy Now
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-10 text-sm font-semibold border-slate-200 dark:border-slate-700"
                    onClick={handleMessageSeller}
                    disabled={contacting}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {contacting ? "Connecting..." : "Message Seller"}
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Verified student peer transaction</span>
              </div>

              {/* Seller Info Card */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Seller Information
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border border-slate-200 dark:border-slate-700">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {listing.seller_initials || listing.seller_name?.[0] || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{listing.seller_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {listing.seller_email}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2.5 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Campus:</span>
                    <strong className="text-slate-800 dark:text-slate-100">Demo Campus (Sopore)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <strong className="text-slate-800 dark:text-slate-100">{listing.location_label}</strong>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Listing Modal */}
      {listing && (
        <EditListingDialog
          listing={listing}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdated={(updated) => setListing(updated as any)}
        />
      )}

      {/* Razorpay Test Checkout Modal */}
      {listing && (
        <RazorpayCheckoutModal
          open={isRazorpayModalOpen}
          onOpenChange={setIsRazorpayModalOpen}
          amount={listing.price}
          title={listing.title}
          description={`${listing.category} • ${listing.location_label}`}
          type="marketplace_purchase"
          typeLabel="Marketplace Item Purchase"
          itemId={listing.id}
          payeeId={listing.seller_id}
          payeeName={listing.seller_name}
          payeeEmail={listing.seller_email}
          notes={{
            category: listing.category,
            pickup_location: listing.location_label,
          }}
          onSuccess={(transaction) => {
            updateListing(listing.id, { status: "sold" as any });
            refreshListing();
            toast.success(`Purchase successful! Pickup OTP: ${transaction.pickup_otp}`);
            setReceiptTx(transaction);
            setIsReceiptOpen(true);
          }}
        />
      )}

      {/* Verified Digital Payment Receipt Dialog */}
      <PaymentReceiptDialog
        transaction={receiptTx}
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
      />
    </div>
  );
}
