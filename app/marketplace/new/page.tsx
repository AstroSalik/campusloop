"use client";

import Link from "next/link";
import { ArrowLeft, Compass, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingForm } from "@/components/marketplace/ListingForm";

export default function NewListingPage() {
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
