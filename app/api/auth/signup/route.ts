import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const userName = (name || cleanEmail.split("@")[0] || "Student").trim();

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

    // 1. Create confirmed user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: userName,
          name: userName,
          campus_id: "00000000-0000-0000-0000-000000000001",
        },
      });

    if (authError) {
      if (
        authError.message.includes("already registered") ||
        authError.message.includes("unique")
      ) {
        return NextResponse.json(
          {
            error:
              "An account with this email already exists. Please sign in instead.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insert into public.users atomically
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          id: userId,
          name: userName,
          email: cleanEmail,
          campus_id: "00000000-0000-0000-0000-000000000001",
          monthly_income: null,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error in public.users:", profileError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: userName,
        email: cleanEmail,
        campus_id: "00000000-0000-0000-0000-000000000001",
        monthly_income: null,
      },
    });
  } catch (err: any) {
    console.error("Signup route exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during registration" },
      { status: 500 }
    );
  }
}
