import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { purgeExpiredSoldListings } from "@/lib/marketplace-cleanup";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const result = await purgeExpiredSoldListings(supabaseAdmin);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Cleanup failed" }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}

