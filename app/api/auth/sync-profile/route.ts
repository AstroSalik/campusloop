import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user from session cookies on the server
    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user: sessionUser },
      error: authError,
    } = await serverSupabase.auth.getUser();

    if (authError || !sessionUser) {
      return NextResponse.json(
        { error: "Unauthorized: Active session required to sync profile" },
        { status: 401 }
      );
    }

    // 2. Extract allowed update fields from body (ignoring any user-supplied ID or email)
    const body = await req.json().catch(() => ({}));
    const { name, campus_id, monthly_income } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase service configuration missing" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const defaultCampusId =
      campus_id || "00000000-0000-0000-0000-000000000001";
    const userName =
      name ||
      sessionUser.user_metadata?.full_name ||
      sessionUser.user_metadata?.name ||
      sessionUser.email?.split("@")[0] ||
      "Student";

    // 3. Upsert into public.users using the verified sessionUser.id and sessionUser.email
    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          id: sessionUser.id,
          name: userName,
          email: (sessionUser.email || "").trim().toLowerCase(),
          campus_id: defaultCampusId,
          monthly_income:
            monthly_income !== undefined ? monthly_income : null,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error upserting public user profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    console.error("Auth profile sync exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

