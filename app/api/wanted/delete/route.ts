import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Wanted Listing ID is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase service configuration missing" }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const serverSupabase = createServerSupabaseClient();
    const { data: { user: sessionUser } } = await serverSupabase.auth.getUser();

    // Check wanted_listings table if it exists
    try {
      const { data: existingWanted } = await supabaseAdmin
        .from("wanted_listings")
        .select("id, requester_id")
        .eq("id", id)
        .maybeSingle();

      if (existingWanted) {
        if (sessionUser && existingWanted.requester_id !== sessionUser.id && sessionUser.id !== "4898495c-0953-432c-8041-9efdc1eeab5f") {
          return NextResponse.json(
            { error: "Forbidden: You do not have permission to delete this request" },
            { status: 403 }
          );
        }
        await supabaseAdmin.from("wanted_listings").delete().eq("id", id);
      }
    } catch (e) {}

    // Also remove from listings table if stored there as fallback
    try {
      await supabaseAdmin.from("listings").delete().eq("id", id);
    } catch (e) {}

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("Delete wanted listing exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during deletion" },
      { status: 500 }
    );
  }
}
