import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const code = (body.code || "").trim();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Verification code must be exactly 6 digits." },
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

    // 1. Fetch latest active OTP record for this email
    const { data: record, error: fetchError } = await supabaseAdmin
      .from("password_resets")
      .select("*")
      .eq("email", email)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!record) {
      return NextResponse.json(
        { error: "No active verification code found or it has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // 2. Check brute force attempts limit
    if (record.attempts >= 5) {
      await supabaseAdmin
        .from("password_resets")
        .update({ used: true })
        .eq("id", record.id);

      return NextResponse.json(
        { error: "Too many incorrect attempts. For campus security, this code has been revoked. Please request a new code." },
        { status: 429 }
      );
    }

    // 3. Verify OTP code hash
    const salt = process.env.SUPABASE_SERVICE_ROLE_KEY || "campusloop-salt";
    const inputHash = crypto.createHash("sha256").update(code + salt).digest("hex");

    if (inputHash !== record.code_hash) {
      // Increment attempt counter
      await supabaseAdmin
        .from("password_resets")
        .update({ attempts: (record.attempts || 0) + 1 })
        .eq("id", record.id);

      const remainingAttempts = 4 - (record.attempts || 0);
      return NextResponse.json(
        { error: `Incorrect verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : "Please request a new code."}` },
        { status: 400 }
      );
    }

    // 4. Code verified! Issue cryptographically random single-use reset authorization token
    const resetToken = crypto.randomBytes(32).toString("hex");

    await supabaseAdmin
      .from("password_resets")
      .update({
        token: resetToken,
        attempts: 0,
      })
      .eq("id", record.id);

    return NextResponse.json({
      success: true,
      message: "Identity verified successfully. You may now set your new password.",
      resetToken,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to verify reset code." },
      { status: 500 }
    );
  }
}
