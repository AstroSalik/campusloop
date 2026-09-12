import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { validateAadhaarVerhoeff, checkNameSimilarity } from "@/lib/kyc-validator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      aadhaar_number, 
      aadhaar_name, 
      doc_front_image, 
      doc_back_image, 
      consent_agreed,
      otp_code,
    } = body;

    // 1. Authenticate user strictly from server session cookies
    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user: sessionUser },
      error: authError,
    } = await serverSupabase.auth.getUser();

    if (authError || !sessionUser?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to verify your account." },
        { status: 401 }
      );
    }

    const targetUserId = sessionUser.id;

    // 2. Validate Aadhaar inputs
    if (!consent_agreed) {
      return NextResponse.json(
        { error: "You must provide explicit consent for Aadhaar KYC verification." },
        { status: 400 }
      );
    }

    const cleanAadhaar = (aadhaar_number || "").replace(/\s+/g, "");
    if (!cleanAadhaar || cleanAadhaar.length !== 12 || !/^\d{12}$/.test(cleanAadhaar)) {
      return NextResponse.json(
        { error: "Please provide a valid 12-digit Aadhaar number." },
        { status: 400 }
      );
    }

    if (!validateAadhaarVerhoeff(cleanAadhaar)) {
      return NextResponse.json(
        { 
          error: "Invalid Aadhaar number. The 12-digit number failed UIDAI checksum verification. Please re-check your Aadhaar card." 
        },
        { status: 422 }
      );
    }

    if (!aadhaar_name || aadhaar_name.trim().length < 3) {
      return NextResponse.json(
        { error: "Please enter your full name exactly as printed on your Aadhaar card." },
        { status: 400 }
      );
    }

    // Compare Aadhaar name with stored profile name
    const storedName =
      sessionUser.user_metadata?.full_name ||
      sessionUser.user_metadata?.name ||
      "";

    if (storedName && !checkNameSimilarity(storedName, aadhaar_name)) {
      return NextResponse.json(
        {
          error: `The name on your Aadhaar card does not match your registered profile name.`,
        },
        { status: 422 }
      );
    }

    if (!doc_front_image) {
      return NextResponse.json(
        { error: "A clear photo or scan of your Aadhaar card (front side) is required." },
        { status: 400 }
      );
    }

    // OTP format validation
    if (otp_code !== undefined && otp_code !== null) {
      const cleanOtp = String(otp_code).trim();
      if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
        return NextResponse.json(
          { error: "Please enter the valid 6-digit Aadhaar OTP." },
          { status: 400 }
        );
      }
    }

    const aadhaarLast4 = cleanAadhaar.slice(-4);
    const submittedAt = new Date().toISOString();

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

    // 1. Update Supabase Auth user_metadata (status set to pending review)
    const { error: adminUpdateError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        verification_status: "pending",
        aadhaar_last4: aadhaarLast4,
        kyc_doc_type: "Aadhaar Card (Under Review)",
        kyc_submitted_at: submittedAt,
        aadhaar_name: aadhaar_name.trim(),
      },
    });

    if (adminUpdateError) {
      console.error("Auth admin metadata update error:", adminUpdateError);
      return NextResponse.json(
        { error: `Failed to update auth verification status: ${adminUpdateError.message}` },
        { status: 500 }
      );
    }

    // 2. Update public.users database table
    const { error: dbUpdateError } = await supabaseAdmin
      .from("users")
      .update({
        verification_status: "pending",
        aadhaar_last4: aadhaarLast4,
        kyc_doc_type: "Aadhaar Card (Under Review)",
        kyc_submitted_at: submittedAt,
      })
      .eq("id", targetUserId);

    if (dbUpdateError) {
      console.error("Database user profile KYC update error:", dbUpdateError);
      return NextResponse.json(
        { error: `Failed to update database profile verification status: ${dbUpdateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Aadhaar KYC documents submitted successfully. Your verification is now in review.",
      verification: {
        status: "pending",
        aadhaar_last4: aadhaarLast4,
        kyc_doc_type: "Aadhaar Card (Under Review)",
        submitted_at: submittedAt,
      },
    });
  } catch (err: any) {
    console.error("Aadhaar KYC verification exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during KYC verification." },
      { status: 500 }
    );
  }
}
