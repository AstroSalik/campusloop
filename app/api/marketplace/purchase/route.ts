import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { extractListingMetadata, injectListingMetadata } from "@/lib/marketplace-meta";
import { purgeExpiredSoldListings } from "@/lib/marketplace-cleanup";
import { createNotification } from "@/lib/notification-service";

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

    // Trigger opportunistic purge of listings sold out >= 3 days
    purgeExpiredSoldListings(supabaseAdmin).catch(() => {});

    // Extract authoritative quantity and metadata (from column or embedded description)
    const { meta: currentMeta, cleanDescription } = extractListingMetadata(listing);
    const currentQty = currentMeta.quantity;

    if (listing.status === "sold" || currentQty <= 0) {
      return NextResponse.json(
        { error: "This item is currently sold out" },
        { status: 400 }
      );
    }

    if (currentQty < qtyToBuy) {
      return NextResponse.json(
        { error: `Only ${currentQty} unit${currentQty === 1 ? "" : "s"} available in stock` },
        { status: 400 }
      );
    }

    // 2. Compute new stock state
    const newQty = Math.max(0, currentQty - qtyToBuy);
    const isNowSoldOut = newQty <= 0;
    const newStatus = isNowSoldOut ? "sold" : "active";
    const soldOutTimestamp = isNowSoldOut ? (currentMeta.sold_out_at || new Date().toISOString()) : null;

    // Embed updated metadata into description so it works even if schema cache lacks quantity column
    const updatedDescription = injectListingMetadata(cleanDescription, {
      quantity: newQty,
      sold_out_at: soldOutTimestamp,
      restock_requests_count: currentMeta.restock_requests_count,
    });

    const updatePayload: Record<string, any> = {
      description: updatedDescription,
      status: newStatus,
      quantity: newQty,
    };

    if (isNowSoldOut) {
      updatePayload.sold_out_at = soldOutTimestamp;
    }

    let { error: updateErr } = await supabaseAdmin
      .from("listings")
      .update(updatePayload)
      .eq("id", listingId);

    // If quantity or sold_out_at column not in schema cache, fallback without those columns
    if (updateErr && (updateErr.code === "PGRST204" || updateErr.message?.includes("quantity") || updateErr.message?.includes("sold_out_at"))) {
      const fallbackPayload: Record<string, any> = {
        description: updatedDescription,
        status: newStatus,
      };
      const fallback = await supabaseAdmin
        .from("listings")
        .update(fallbackPayload)
        .eq("id", listingId);
      updateErr = fallback.error;
    }

    if (updateErr) {
      console.error("[marketplace-purchase] Error updating listing stock:", updateErr.message);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Deliver notification to seller
    createNotification(supabaseAdmin, {
      userId: listing.seller_id,
      type: "purchase",
      title: isNowSoldOut ? "🔥 Item Sold Out!" : "🛍️ Item Purchased!",
      message: `A student bought ${qtyToBuy} unit${qtyToBuy > 1 ? "s" : ""} of "${listing.title}". ${newQty} left in stock.`,
      link: `/marketplace/${listingId}`,
      listingId,
    }).catch(() => {});

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
