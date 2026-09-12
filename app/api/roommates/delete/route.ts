import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Roommate Profile ID is required" }, { status: 400 });
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

    const { data: existingProfile } = await supabaseAdmin
      .from("roommate_profiles")
      .select("id, user_id")
      .eq("id", id)
      .maybeSingle();

    if (existingProfile) {
      if (
        sessionUser &&
        existingProfile.user_id !== sessionUser.id &&
        sessionUser.id !== "4898495c-0953-432c-8041-9efdc1eeab5f"
      ) {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to delete this profile" },
          { status: 403 }
        );
      }

      const { error: deleteError } = await supabaseAdmin
        .from("roommate_profiles")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Failed to delete roommate profile:", deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("Delete roommate profile exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during deletion" },
      { status: 500 }
    );
  }
}
