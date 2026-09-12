import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase service configuration missing" }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Get authenticated session user if present
    const serverSupabase = createServerSupabaseClient();
    const { data: { user: sessionUser } } = await serverSupabase.auth.getUser();

    // 2. Fetch existing listing to verify existence and ownership
    const { data: existingListing } = await supabaseAdmin
      .from("listings")
      .select("id, seller_id")
      .eq("id", id)
      .maybeSingle();

    if (existingListing) {
      // If user is authenticated, ensure they own the listing (or allow primary demo user)
      if (sessionUser && existingListing.seller_id !== sessionUser.id && sessionUser.id !== "4898495c-0953-432c-8041-9efdc1eeab5f") {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to delete this listing" },
          { status: 403 }
        );
      }

      // 3. Delete listing images first to prevent foreign key issues
      await supabaseAdmin.from("listing_images").delete().eq("listing_id", id);

      // 4. Delete the listing from database
      const { error: deleteError } = await supabaseAdmin
        .from("listings")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Failed to delete listing:", deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("Delete listing exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during deletion" },
      { status: 500 }
    );
  }
}
