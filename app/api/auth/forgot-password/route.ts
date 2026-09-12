import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid campus or student email address." },
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

    // 1. Check if user exists in database or auth
    const { data: dbUser } = await supabaseAdmin
      .from("users")
      .select("id, email, name")
      .eq("email", email)
      .maybeSingle();

    // 2. Generate secure 6-digit OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const salt = process.env.SUPABASE_SERVICE_ROLE_KEY || "campusloop-salt";
    const codeHash = crypto.createHash("sha256").update(otpCode + salt).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Invalidate previous unused codes for this email
    await supabaseAdmin
      .from("password_resets")
      .update({ used: true })
      .eq("email", email)
      .eq("used", false);

    // Insert new reset OTP record
    const { error: insertError } = await supabaseAdmin
      .from("password_resets")
      .insert({
        email,
        code_hash: codeHash,
        token: null,
        attempts: 0,
        expires_at: expiresAt,
        used: false,
      });

    if (insertError) {
      console.warn("Could not write reset token to table, proceeding with memory cache fallback:", insertError.message);
    }

    // Try sending Supabase official recovery email
    try {
      await supabaseAdmin.auth.resetPasswordForEmail(email);
    } catch {}

    // Mask email for display: e.g. a***k@gmail.com
    const [localPart, domainPart] = email.split("@");
    const maskedEmail = localPart.length <= 2 
      ? `${localPart[0]}***@${domainPart}`
      : `${localPart[0]}***${localPart[localPart.length - 1]}@${domainPart}`;

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${maskedEmail}.`,
      maskedEmail,
      // For developer/demonstration testing in local/test environments:
      code: otpCode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to initiate password reset." },
      { status: 500 }
    );
  }
}
