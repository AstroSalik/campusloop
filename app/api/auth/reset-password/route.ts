import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const resetToken = (body.resetToken || "").trim();
    const newPassword = body.newPassword;

    if (!email || !resetToken) {
      return NextResponse.json(
        { error: "Email and authorized reset token are required." },
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
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server authentication configuration missing." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Verify reset authorization token in password_resets
    const { data: record } = await supabaseAdmin
      .from("password_resets")
      .select("*")
      .eq("email", email)
      .eq("token", resetToken)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired reset session. Please request a new verification code." },
        { status: 403 }
      );
    }

    // 2. Find user ID from auth.users or public.users
    let userId: string | null = null;
    const { data: dbUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (dbUser?.id) {
      userId = dbUser.id;
    } else {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const matched = authUsers?.users?.find(
        (u) => u.email?.toLowerCase() === email
      );
      if (matched?.id) userId = matched.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "No student account found associated with this email." },
        { status: 404 }
      );
    }

    // 3. Update password in Supabase Auth via Admin
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Failed to update password." },
        { status: 500 }
      );
    }

    // 4. Mark token as used to prevent replay attacks
    await supabaseAdmin
      .from("password_resets")
      .update({ used: true })
      .eq("id", record.id);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now sign in with your new password.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error while resetting password." },
      { status: 500 }
    );
  }
}
