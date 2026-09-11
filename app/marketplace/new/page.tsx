"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { getClientDemoSession, DemoUser } from "@/lib/auth";
import { AuthRequiredGuard } from "@/components/auth/AuthRequiredGuard";

export default function NewListingPage() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(() => getClientDemoSession());

  useEffect(() => {
    const handleAuth = () => {
      setCurrentUser(getClientDemoSession());
    };
    window.addEventListener("campusloop_auth_changed", handleAuth);
    return () => window.removeEventListener("campusloop_auth_changed", handleAuth);
  }, []);

  if (!currentUser) {
    return (
      <AuthRequiredGuard
        title="Student Sign In Required"
        featureName="Post Marketplace Listing"
        description="To list items on the student marketplace, verify campus integrity, and receive buyer offers, please sign in to your student account."
        redirectUrl="/marketplace/new"
        backUrl="/marketplace"
        backLabel="Back to Marketplace"
      />
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-900 -ml-2">
          <Link href="/marketplace">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>
      </div>

      <ListingForm />
    </div>
  );
}
