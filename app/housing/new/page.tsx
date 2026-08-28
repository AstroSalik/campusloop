"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomForm } from "@/components/housing/RoomForm";

export default function NewRoomPage() {
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
