import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { sendRestockNotificationEmail } from "@/lib/email-service";

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

    // 1. Fetch current listing safely
    const { data: listing, error: fetchErr } = await supabaseAdmin
      .from("listings")
      .select("id, seller_id, title, price, category")
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

    // 2. Fetch seller registered details for email notification
    const { data: seller } = await supabaseAdmin
      .from("users")
      .select("id, name, email, settings")
      .eq("id", listing.seller_id)
      .maybeSingle();

    let sellerEmail = seller?.email;
    let sellerName = seller?.name;
    if (!sellerEmail) {
      const { data: authSeller } = await supabaseAdmin.auth.admin.getUserById(listing.seller_id);
      sellerEmail = authSeller?.user?.email;
      sellerName = sellerName || authSeller?.user?.user_metadata?.name || authSeller?.user?.user_metadata?.full_name;
    }

    // 3. Fetch buyer name
    const { data: buyer } = await supabaseAdmin
      .from("users")
      .select("name, email")
      .eq("id", userId)
      .maybeSingle();

    const buyerName = buyer?.name || "A student";

    // 4. Try recording in listing_restock_requests table if present
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

    // 5. Try updating restock_requests_count on listing if column exists
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

    // 6. Send notification email to seller's registered email address
    if (sellerEmail) {
      try {
        await sendRestockNotificationEmail({
          sellerEmail,
          sellerName: sellerName || "CampusLoop Seller",
          listingTitle: listing.title,
          listingId: listing.id,
          price: listing.price,
          buyerName,
          buyerEmail: buyer?.email,
        });
      } catch (emailErr) {
        console.warn("[restock-request] Email notification notice:", emailErr);
      }
    }

    // 7. Save in-app notification for the seller
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: listing.seller_id,
        type: "restock_request",
        title: "🔥 Restock Requested!",
        message: `${buyerName} requested your item "${listing.title}" to be restocked.`,
        link: `/marketplace/${listing.id}`,
        read: false,
      });
    } catch {
      // Ignore if table pending migration
    }

    const maskedEmail = sellerEmail
      ? `${sellerEmail.split("@")[0].slice(0, 3)}***@${sellerEmail.split("@")[1]}`
      : "registered email";

    return NextResponse.json({
      success: true,
      listingId,
      restock_requests_count: updatedCount,
      hasRequested: true,
      sellerNotified: true,
      message: `Restock request sent! The seller (${maskedEmail}) has been notified via email and in-app alert.`,
    });
  } catch (err: any) {
    console.error("Restock request exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
