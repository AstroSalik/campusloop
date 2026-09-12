import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { listingId, quantity: requestedQty = 1 } = body;

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const qtyToBuy = Math.max(1, parseInt(requestedQty, 10) || 1);

    const buyerId = await getAuthenticatedUserId(req);
    if (!buyerId) {
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

    // 1. Fetch current listing state
    const { data: listing, error: fetchErr } = await supabaseAdmin
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .maybeSingle();

    if (fetchErr) {
      console.error("[marketplace-purchase] Error fetching listing:", fetchErr.message);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.seller_id === buyerId) {
      return NextResponse.json({ error: "You cannot purchase your own listing" }, { status: 400 });
    }

    const currentQty = typeof listing.quantity === "number" ? listing.quantity : (listing.status === "sold" ? 0 : 1);

    if (listing.status === "sold" || currentQty <= 0) {
      return NextResponse.json(
        { error: "This item is currently sold out" },
        { status: 400 }
      );
    }

    if (currentQty < qtyToBuy) {
      return NextResponse.json(
        { error: `Only ${currentQty} units available in stock` },
        { status: 400 }
      );
    }

    // 2. Compute new stock state
    const newQty = currentQty - qtyToBuy;
    const isNowSoldOut = newQty <= 0;
    const newStatus = isNowSoldOut ? "sold" : listing.status || "active";
    const soldOutTimestamp = isNowSoldOut ? new Date().toISOString() : null;

    const updatePayload: Record<string, any> = {
      quantity: Math.max(0, newQty),
      status: newStatus,
    };

    if (isNowSoldOut) {
      updatePayload.sold_out_at = soldOutTimestamp;
    }

    let { error: updateErr } = await supabaseAdmin
      .from("listings")
      .update(updatePayload)
      .eq("id", listingId);

    // If quantity or sold_out_at column not in schema cache, fallback to status only
    if (updateErr && (updateErr.code === "PGRST204" || updateErr.message?.includes("quantity"))) {
      const fallback = await supabaseAdmin
        .from("listings")
        .update({ status: newStatus })
        .eq("id", listingId);
      updateErr = fallback.error;
    }

    if (updateErr) {
      console.error("[marketplace-purchase] Error updating listing stock:", updateErr.message);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      listingId,
      purchasedQuantity: qtyToBuy,
      remainingQuantity: Math.max(0, newQty),
      status: newStatus,
      sold_out_at: soldOutTimestamp,
    });
  } catch (err: any) {
    console.error("Purchase marketplace listing exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during purchase" },
      { status: 500 }
    );
  }
}
