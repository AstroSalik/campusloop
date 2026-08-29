"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WantedForm } from "@/components/wanted/WantedForm";

export default function NewWantedPage() {
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
