import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to change your password." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to verify your identity." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    if (!hasLetter || !hasNumberOrSymbol) {
      return NextResponse.json(
        { error: "New password must contain both letters and at least one number or symbol." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server authentication configuration missing." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Fetch user's email from auth or users table
    const { data: authUserData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    let email = authUserData?.user?.email;

    if (!email) {
      const { data: dbUser } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("id", userId)
        .maybeSingle();
      email = dbUser?.email;
    }

    if (!email) {
      return NextResponse.json(
        { error: "User account email not found." },
        { status: 404 }
      );
    }

    // 2. VERIFY CURRENT PASSWORD: Authenticate with Supabase using current credentials
    const supabaseAnon = createAdminClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Incorrect current password. Identity verification failed." },
        { status: 400 }
      );
    }

    // 3. Update password via Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Failed to update password." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error while changing password." },
      { status: 500 }
    );
  }
}
