import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Sign in to delete this request." }, { status: 401 });
    }

    const { id } = await request.json().catch(() => ({}));
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "Wanted Listing ID is required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: "Deletion is temporarily unavailable." }, { status: 503 });
    }

    const db = createClient(url, key, { auth: { persistSession: false } });
    const { data: record, error: lookupError } = await db.from("wanted_listings")
      .select("requester_id").eq("id", id).maybeSingle();
    if (lookupError && !["42P01", "PGRST205"].includes(lookupError.code)) throw lookupError;
    if (record && record.requester_id !== userId) {
      return NextResponse.json({ error: "You can only delete your own request." }, { status: 403 });
    }

    if (record) {
      const { error } = await db.from("wanted_listings").delete().eq("id", id).eq("requester_id", userId);
      if (error) throw error;
    }

    // Older requests were stored as buy listings. Keep their type and ownership checks separate.
    const { data: legacy, error: legacyLookupError } = await db.from("listings").select("seller_id")
      .eq("id", id).eq("type", "buy").maybeSingle();
    if (legacyLookupError) throw legacyLookupError;
    if (legacy && legacy.seller_id === userId) {
      const { error } = await db.from("listings").delete().eq("id", id).eq("type", "buy").eq("seller_id", userId);
      if (error) throw error;
    } else if (legacy && !record) {
      return NextResponse.json({ error: "You can only delete your own request." }, { status: 403 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Delete request failed:", error);
    return NextResponse.json({ error: "Could not delete this request. Please try again." }, { status: 500 });
  }
}
