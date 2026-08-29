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
  Clock, 
  Cpu, 
  Edit3, 
  HandHeart, 
  HelpCircle, 
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
  User, 
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
  getWantedListingById, 
  deleteWantedListing, 
  StoredWantedListing 
} from "@/lib/wanted-data";
import { getClientDemoSession, PRIMARY_DEMO_USER } from "@/lib/auth";
import { getOrCreateWantedConversation } from "@/lib/conversations";
import { EditWantedDialog } from "@/components/wanted/EditWantedDialog";

export default function WantedDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const currentUser = getClientDemoSession() || PRIMARY_DEMO_USER;
  const [wanted, setWanted] = useState<StoredWantedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const item = getWantedListingById(params.id);
    setWanted(item || null);
    setLoading(false);
  }, [params.id]);

  const handleDelete = () => {
    if (!wanted) return;
    const confirmed = window.confirm(`Are you sure you want to delete "${wanted.title}"? This cannot be undone.`);
    if (confirmed) {
      deleteWantedListing(wanted.id);
      toast.success("Wanted request removed.");
      router.push("/wanted");
    }
  };

  const handleProvideThis = async () => {
    if (!wanted) return;

    if (wanted.requester_id === currentUser.id) {
      toast.info("This is your own wanted request!");
      return;
    }

    setContacting(true);
    try {
      const conversationId = await getOrCreateWantedConversation(
        wanted.id,
        currentUser.id,
        wanted.requester_id
      );

      toast.success(`Connected with ${wanted.requester_name}! Opening conversation...`);
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
        return <Bike className="h-12 w-12 text-primary dark:text-teal-400" />;
      case "books":
        return <BookOpen className="h-12 w-12 text-primary dark:text-teal-400" />;
      case "electronics":
        return <Cpu className="h-12 w-12 text-primary dark:text-teal-400" />;
      case "appliances":
        return <Zap className="h-12 w-12 text-primary dark:text-teal-400" />;
      case "furniture":
        return <Home className="h-12 w-12 text-primary dark:text-teal-400" />;
      default:
        return <Package className="h-12 w-12 text-primary dark:text-teal-400" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (!wanted) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Wanted Request Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This buyer request may have been fulfilled or removed by the student.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white">
          <Link href="/marketplace?type=buy">Browse Wanted Requests</Link>
        </Button>
      </div>
    );
  }

  const isOwner = wanted.requester_id === currentUser.id;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-6">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white -ml-2">
          <Link href="/marketplace?type=buy">
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
                className="gap-1.5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              >
                <Edit3 className="h-3.5 w-3.5 text-primary dark:text-teal-400" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-800"
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
              toast.success("Wanted request link copied to clipboard!");
            }}
            className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Item Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Header Banner */}
          <div className="relative rounded-2xl bg-gradient-to-br from-teal-50/60 via-slate-50 to-emerald-50/40 dark:from-teal-950/30 dark:via-slate-900 dark:to-emerald-950/20 border border-primary/20 dark:border-primary/30 p-8 shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/80 dark:border-slate-700">
                  {getCategoryIcon(wanted.category)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary text-white text-xs uppercase font-bold tracking-wider">
                      Wanted Item
                    </Badge>
                    <Badge variant="outline" className="bg-white/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700">
                      {wanted.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800 capitalize text-xs">
                      {wanted.status}
                    </Badge>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {wanted.title}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>Preferred Location: <strong>{wanted.location_label || "Hostel Campus"}</strong></span>
                <span>•</span>
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Posted {new Date(wanted.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
              </div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Request Details & Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  What the student needs
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {wanted.description}
                </p>
              </div>

              {/* Quick Spec Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-850">
                  <span className="text-[11px] text-slate-400 block">Category</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{wanted.category}</span>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-850">
                  <span className="text-[11px] text-slate-400 block">Maximum Budget</span>
                  <span className="text-sm font-semibold text-primary dark:text-teal-400">Up to ₹{wanted.budget_max.toLocaleString("en-IN")}</span>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-850 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400 block">Request Status</span>
                  <span className="text-sm font-semibold text-emerald-600 capitalize">{wanted.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Budget & Action Card */}
        <div className="space-y-6">
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm sticky top-20">
            <CardHeader className="pb-4">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Buyer Budget Ceiling</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  Up to ₹{wanted.budget_max.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Student is looking to purchase this item within this price range.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Action Button: I Can Provide This */}
              {isOwner ? (
                <div className="space-y-2.5">
                  <div className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-center text-xs text-slate-700 dark:text-slate-300 font-medium">
                    This is your wanted request.
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-10 font-semibold gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit3 className="h-4 w-4 text-primary dark:text-teal-400" />
                    Edit Request Details
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full h-10 font-semibold gap-2 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Request
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-xs gap-2 transition-all active:scale-98"
                  onClick={handleProvideThis}
                  disabled={contacting}
                >
                  <HandHeart className="h-5 w-5" />
                  {contacting ? "Connecting..." : "I Can Provide This"}
                </Button>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Direct 1:1 chat with verified student buyer</span>
              </div>

              {/* Student Requester Info Card */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Requested By
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border border-slate-200 dark:border-slate-700">
                    <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-teal-300 font-bold text-sm">
                      {wanted.requester_initials || wanted.requester_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{wanted.requester_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {wanted.requester_email}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Campus:</span>
                    <strong className="text-slate-800 dark:text-slate-200">Demo Campus (Sopore)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{wanted.location_label || "Hostel 3"}</strong>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {wanted && (
        <EditWantedDialog
          wanted={wanted}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdated={(updated) => setWanted(updated)}
        />
      )}
    </div>
  );
}
