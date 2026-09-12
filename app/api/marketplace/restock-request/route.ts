import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase service configuration missing" }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Fetch current listing
    const { data: listing, error: fetchErr } = await supabaseAdmin
      .from("listings")
      .select("id, seller_id, title, restock_requests_count")
      .eq("id", listingId)
      .maybeSingle();

    if (fetchErr || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.seller_id === userId) {
      return NextResponse.json({ error: "You cannot request restock on your own item" }, { status: 400 });
    }

    // 2. Try inserting into listing_restock_requests table
    let isNewRequest = true;
    try {
      const { data: existingReq } = await supabaseAdmin
        .from("listing_restock_requests")
        .select("id")
        .eq("listing_id", listingId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingReq) {
        isNewRequest = false;
      } else {
        await supabaseAdmin
          .from("listing_restock_requests")
          .insert({
            listing_id: listingId,
            user_id: userId,
          });
      }
    } catch (e) {
      // Table may be pending migration; still handle gracefully
    }

    let newCount = (listing.restock_requests_count || 0);
    if (isNewRequest) {
      newCount += 1;
      try {
        await supabaseAdmin
          .from("listings")
          .update({ restock_requests_count: newCount })
          .eq("id", listingId);
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      listingId,
      restock_requests_count: newCount,
      hasRequested: true,
    });
  } catch (err: any) {
    console.error("Restock request exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
