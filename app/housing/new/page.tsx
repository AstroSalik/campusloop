"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomForm } from "@/components/housing/RoomForm";
import { getClientDemoSession, DemoUser } from "@/lib/auth";
import { AuthRequiredGuard } from "@/components/auth/AuthRequiredGuard";

export default function NewRoomPage() {
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
        featureName="Post Room Accommodation"
        description="To list available flats, hostels, or room spots for student flatmates, please sign in with your verified campus account."
        redirectUrl="/housing/new"
        backUrl="/housing"
        backLabel="Back to Housing Catalog"
      />
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-900 -ml-2">
          <Link href="/housing">
            <ArrowLeft className="h-4 w-4" />
            Back to Housing Listings
          </Link>
        </Button>
      </div>

      <RoomForm />
    </div>
  );
}
