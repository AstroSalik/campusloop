import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      email, 
      password, 
      name,
      campus_name,
      city,
      department,
      year_of_study,
      phone,
      student_id,
      monthly_income,
    } = body;

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = typeof password === "string" ? password : "";
    const userName = (name || cleanEmail.split("@")[0] || "Student").trim();
    const resolvedCampusName = (campus_name || "Lovely Professional University (LPU)").trim();
    const resolvedCity = (city || "").trim();
    const resolvedDept = (department || "").trim();
    const resolvedYear = (year_of_study || "").trim();
    const resolvedPhone = (phone || "").trim();
    const normalizedStudentId = (student_id || "").trim() || null;

    let resolvedIncome: number | null = null;
    if (monthly_income !== undefined && monthly_income !== null && String(monthly_income).trim() !== "") {
      const parsed = Number(monthly_income);
      resolvedIncome = !isNaN(parsed) && parsed >= 0 ? parsed : null;
    }

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Password security enforcement:
    // Minimum 8 characters, must contain at least 1 letter and 1 number or special character
    if (cleanPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const hasLetter = /[a-zA-Z]/.test(cleanPassword);
    const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(cleanPassword);

    if (!hasLetter || !hasNumberOrSymbol) {
      return NextResponse.json(
        {
          error:
            "Password must contain both letters and at least one number or symbol.",
        },
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

    // Authoritative campus resolution: derive or create campus_id matching resolvedCampusName
    let resolvedCampusId = "00000000-0000-0000-0000-000000000001";
    try {
      const { data: existingCampus } = await supabaseAdmin
        .from("campuses")
        .select("id")
        .ilike("name", resolvedCampusName)
        .maybeSingle();

      if (existingCampus?.id) {
        resolvedCampusId = existingCampus.id;
      } else {
        const { data: newCampus } = await supabaseAdmin
          .from("campuses")
          .insert({
            name: resolvedCampusName,
            city: resolvedCity || "Campus Area",
          })
          .select("id")
          .single();

        if (newCampus?.id) {
          resolvedCampusId = newCampus.id;
        }
      }
    } catch (campusErr) {
      console.warn("Authoritative campus resolution notice:", campusErr);
    }

    // 1. Create confirmed user in Supabase Auth with rich metadata
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: userName,
          name: userName,
          campus_id: resolvedCampusId,
          campus_name: resolvedCampusName,
          city: resolvedCity,
          department: resolvedDept,
          year_of_study: resolvedYear,
          phone: resolvedPhone,
          student_id: normalizedStudentId,
          monthly_income: resolvedIncome,
          verification_status: "unverified",
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

    // 2. Insert into public.users atomically (with graceful fallback for columns)
    try {
      await supabaseAdmin
        .from("users")
        .upsert(
          {
            id: userId,
            name: userName,
            email: cleanEmail,
            campus_id: resolvedCampusId,
            campus_name: resolvedCampusName,
            city: resolvedCity,
            department: resolvedDept,
            year_of_study: resolvedYear,
            phone: resolvedPhone,
            student_id: normalizedStudentId,
            monthly_income: resolvedIncome,
            verification_status: "unverified",
          },
          { onConflict: "id" }
        );
    } catch (profileError) {
      console.warn("Public users table extended insert fallback:", profileError);
      // Fallback to base columns if schema not yet updated
      try {
        await supabaseAdmin
          .from("users")
          .upsert(
            {
              id: userId,
              name: userName,
              email: cleanEmail,
              campus_id: resolvedCampusId,
              monthly_income: resolvedIncome,
            },
            { onConflict: "id" }
          );
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: userName,
        email: cleanEmail,
        campus_id: resolvedCampusId,
        campus_name: resolvedCampusName,
        city: resolvedCity,
        department: resolvedDept,
        year_of_study: resolvedYear,
        phone: resolvedPhone,
        student_id: normalizedStudentId,
        monthly_income: resolvedIncome,
        verification_status: "unverified",
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
