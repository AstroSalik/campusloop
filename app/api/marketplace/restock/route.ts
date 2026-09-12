import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { listingId, addedQuantity, newQuantity } = body;

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const sellerId = await getAuthenticatedUserId(req);
    if (!sellerId) {
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

    // 1. Fetch current listing and verify ownership
    const { data: listing, error: fetchErr } = await supabaseAdmin
      .from("listings")
      .select("id, seller_id, quantity, status, title")
      .eq("id", listingId)
      .maybeSingle();

    if (fetchErr) {
      console.error("[marketplace-restock] Error fetching listing:", fetchErr.message);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.seller_id !== sellerId) {
      return NextResponse.json(
        { error: "Forbidden: You are not the seller of this listing" },
        { status: 403 }
      );
    }

    // Determine target quantity
    let resolvedQuantity: number;
    if (typeof newQuantity === "number" && !isNaN(newQuantity)) {
      resolvedQuantity = Math.max(1, newQuantity);
    } else if (typeof addedQuantity === "number" && !isNaN(addedQuantity)) {
      const current = typeof listing.quantity === "number" ? listing.quantity : 0;
      resolvedQuantity = Math.max(1, current + addedQuantity);
    } else {
      resolvedQuantity = 1;
    }

    // 2. Reactivate listing with new stock
    const { error: updateErr } = await supabaseAdmin
      .from("listings")
      .update({
        quantity: resolvedQuantity,
        status: "active",
        sold_out_at: null,
      })
      .eq("id", listingId);

    if (updateErr) {
      console.error("[marketplace-restock] Error restocking listing:", updateErr.message);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      listingId,
      quantity: resolvedQuantity,
      status: "active",
      sold_out_at: null,
    });
  } catch (err: any) {
    console.error("Restock marketplace listing exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during restock" },
      { status: 500 }
    );
  }
}
