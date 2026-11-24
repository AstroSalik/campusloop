import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { injectListingMetadata } from "@/lib/marketplace-meta";
import { purgeExpiredSoldListings } from "@/lib/marketplace-cleanup";

export async function POST(req: NextRequest) {
  try {
    const sellerId = await getAuthenticatedUserId(req);
    if (!sellerId) {
      return NextResponse.json({ error: "Sign in to post a listing." }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const listingData = body.listing || body;

    const title = (listingData.title || "").trim();
    const description = (listingData.description || "").trim();
    const price = Number(listingData.price);
    const category = (listingData.category || "Other").trim();
    const type = listingData.type || "sell";
    const condition = listingData.condition || "Good";
    const locationLabel = listingData.location_label || "Campus";
    const status = listingData.status || "active";
    const quantity = Math.max(1, parseInt(listingData.quantity, 10) || 1);
    const images = Array.isArray(listingData.images) ? listingData.images : [];

    if (!title || isNaN(price) || !description) {
      return NextResponse.json(
        { error: "Title, description, and valid price are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server database configuration missing." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Verify seller exists in public.users
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id, campus_id, name, email")
      .eq("id", sellerId)
      .maybeSingle();

    if (!existingUser) {
      // If user not in public.users, check auth.users and create record
      const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(sellerId);
      if (authUserData?.user) {
        const u = authUserData.user;
        const fallbackCampus = listingData.campus_id || "00000000-0000-0000-0000-000000000001";
        await supabaseAdmin.from("users").upsert({
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || listingData.seller_name || "Student Seller",
          email: u.email || "",
          campus_id: fallbackCampus,
        });
      }
    }

    // 2. Resolve valid campus_id with foreign key safety
    let campusId = listingData.campus_id || existingUser?.campus_id;
    if (campusId) {
      const { data: campusCheck } = await supabaseAdmin
        .from("campuses")
        .select("id")
        .eq("id", campusId)
        .maybeSingle();
      if (!campusCheck) {
        campusId = null;
      }
    }

    if (!campusId) {
      // Fallback to first available campus in the database
      const { data: firstCampus } = await supabaseAdmin
        .from("campuses")
        .select("id")
        .limit(1)
        .maybeSingle();
      campusId = firstCampus?.id || "00000000-0000-0000-0000-000000000001";
    }

    const listingId = listingData.id || `listing-custom-${Date.now().toString(36)}`;

    // Purge any listings that have been sold out for >= 3 days
    purgeExpiredSoldListings(supabaseAdmin).catch(() => {});

    // 3. Attempt insertion with schema tolerance
    // Always embed dynamic metadata into description as an ultra-reliable fallback
    const descriptionWithMeta = injectListingMetadata(description, {
      quantity,
      sold_out_at: null,
      restock_requests_count: 0,
    });

    // Try first with extended columns (quantity, sold_out_at, restock_requests_count)
    const extendedPayload = {
      id: listingId,
      seller_id: sellerId,
      campus_id: campusId,
      title,
      description: descriptionWithMeta,
      category,
      type,
      price,
      condition,
      location_label: locationLabel,
      status,
      quantity,
      sold_out_at: null,
      restock_requests_count: 0,
      created_at: listingData.created_at || new Date().toISOString(),
    };

    let { error: insertErr } = await supabaseAdmin.from("listings").insert(extendedPayload);

    // If extended columns don't exist in Supabase schema cache yet (PGRST204), fall back to base columns
    if (insertErr && (insertErr.code === "PGRST204" || insertErr.message?.includes("quantity") || insertErr.message?.includes("sold_out_at") || insertErr.message?.includes("restock_requests_count"))) {
      console.warn("[marketplace-create] Extended columns missing in schema cache, falling back to base columns with embedded metadata.");
      const basePayload = {
        id: listingId,
        seller_id: sellerId,
        campus_id: campusId,
        title,
        description: descriptionWithMeta,
        category,
        type,
        price,
        condition,
        location_label: locationLabel,
        status,
        created_at: listingData.created_at || new Date().toISOString(),
      };
      const fallbackResult = await supabaseAdmin.from("listings").insert(basePayload);
      insertErr = fallbackResult.error;
    }

    if (insertErr?.code === "23505") {
      const { data: ownedListing, error } = await supabaseAdmin.from("listings")
        .select("id").eq("id", listingId).eq("seller_id", sellerId).maybeSingle();
      if (error) throw error;
      if (!ownedListing) {
        return NextResponse.json({ error: "This listing could not be created. Try a new listing." }, { status: 409 });
      }
    } else if (insertErr) {
      console.error("[marketplace-create] Insert failed:", insertErr);
      return NextResponse.json(
        { error: insertErr.message || "Failed to save listing to database." },
        { status: 500 }
      );
    }

    // 4. Save listing images
    if (images.length > 0) {
      const imageRows = images.map((img: any, idx: number) => ({
        id: img.id || `img-${listingId}-${idx}`,
        listing_id: listingId,
        image_url: img.image_url,
      }));
      const { error: imgErr } = await supabaseAdmin.from("listing_images").insert(imageRows);
      if (imgErr && imgErr.code !== "23505") {
        console.warn("[marketplace-create] Image insert notice:", imgErr.message);
      }
    }

    // 5. Fetch authoritative inserted listing
    const { data: savedRow } = await supabaseAdmin
      .from("listings")
      .select("*, listing_images(*), users(name, email)")
      .eq("id", listingId)
      .eq("seller_id", sellerId)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      message: "Listing created successfully.",
      listing: savedRow || extendedPayload,
    });
  } catch (error: any) {
    console.error("[marketplace-create] Unhandled exception:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error while creating listing." },
      { status: 500 }
    );
  }
}
