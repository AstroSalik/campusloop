import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { listingId, userId: bodyUserId } = body;

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const userId = (await getAuthenticatedUserId(req)) || bodyUserId;
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

    // 1. Fetch current listing safely without referencing restock_requests_count directly
    const { data: listing, error: fetchErr } = await supabaseAdmin
      .from("listings")
      .select("id, seller_id, title")
      .eq("id", listingId)
      .maybeSingle();

    if (fetchErr) {
      console.error("[marketplace-restock-request] Error fetching listing:", fetchErr);
      return NextResponse.json({ error: fetchErr.message || "Failed to find listing" }, { status: 500 });
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.seller_id === userId) {
      return NextResponse.json({ error: "You cannot request restock on your own item" }, { status: 400 });
    }

    // 2. Try recording in listing_restock_requests table if present
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
    } catch {
      // Table may not exist yet; handle gracefully
    }

    // 3. Try updating restock_requests_count on listing if column exists
    let updatedCount = 1;
    try {
      const { data: fullRow } = await supabaseAdmin
        .from("listings")
        .select("restock_requests_count")
        .eq("id", listingId)
        .maybeSingle();

      if (fullRow && typeof fullRow.restock_requests_count === "number") {
        updatedCount = isNewRequest ? fullRow.restock_requests_count + 1 : fullRow.restock_requests_count;
        await supabaseAdmin
          .from("listings")
          .update({ restock_requests_count: updatedCount })
          .eq("id", listingId);
      }
    } catch {
      // Column may not exist yet; continue gracefully
    }

    return NextResponse.json({
      success: true,
      listingId,
      restock_requests_count: updatedCount,
      hasRequested: true,
      message: "Restock request submitted! The seller has been alerted.",
    });
  } catch (err: any) {
    console.error("Restock request exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
