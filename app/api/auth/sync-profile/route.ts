import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { id, name, email, campus_id, monthly_income } = await req.json();

    if (!id || !email) {
      return NextResponse.json(
        { error: "Missing required user id or email" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase service configuration missing" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const defaultCampusId =
      campus_id || "00000000-0000-0000-0000-000000000001";
    const userName = name || email.split("@")[0] || "Student";

    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          id,
          name: userName,
          email: email.trim().toLowerCase(),
          campus_id: defaultCampusId,
          monthly_income: monthly_income !== undefined ? monthly_income : null,
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
