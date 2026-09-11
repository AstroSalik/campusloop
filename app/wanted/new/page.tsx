"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WantedForm } from "@/components/wanted/WantedForm";
import { getClientDemoSession, DemoUser } from "@/lib/auth";
import { AuthRequiredGuard } from "@/components/auth/AuthRequiredGuard";

export default function NewWantedPage() {
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
        featureName="Post Wanted Request"
        description="To post a request for items you need, get offers from verified student peers, and direct message sellers, please sign in with your student account."
        redirectUrl="/wanted/new"
        backUrl="/marketplace?type=buy"
        backLabel="Back to Marketplace"
      />
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white -ml-2">
          <Link href="/wanted">
            <ArrowLeft className="h-4 w-4" />
            Back to Wanted Listings
          </Link>
        </Button>
      </div>

      <WantedForm />
    </div>
  );
}
