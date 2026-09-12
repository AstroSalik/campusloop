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
    const { 
      name, 
      campus_id, 
      campus_name, 
      city, 
      department, 
      year_of_study, 
      phone, 
      student_id,
      monthly_income, 
      avatar,
      verification_status 
    } = body;

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
      campus_id || sessionUser.user_metadata?.campus_id || "00000000-0000-0000-0000-000000000001";
    const userName =
      name ||
      sessionUser.user_metadata?.full_name ||
      sessionUser.user_metadata?.name ||
      sessionUser.email?.split("@")[0] ||
      "Student";

    const resolvedCampusName = campus_name || sessionUser.user_metadata?.campus_name || "Lovely Professional University (LPU)";
    const resolvedCity = city || sessionUser.user_metadata?.city || "";
    const resolvedDept = department || sessionUser.user_metadata?.department || "";
    const resolvedYear = year_of_study || sessionUser.user_metadata?.year_of_study || "";
    const resolvedPhone = phone || sessionUser.user_metadata?.phone || "";
    const resolvedVerification = verification_status || sessionUser.user_metadata?.verification_status || "unverified";
    const normalizedStudentId = student_id !== undefined ? ((student_id || "").trim() || null) : undefined;

    // Update user_metadata in Auth
    try {
      const metaUpdates: Record<string, any> = {
        full_name: userName,
        name: userName,
        campus_name: resolvedCampusName,
        city: resolvedCity,
        department: resolvedDept,
        year_of_study: resolvedYear,
        phone: resolvedPhone,
        verification_status: resolvedVerification,
      };
      if (normalizedStudentId !== undefined) {
        metaUpdates.student_id = normalizedStudentId;
      }
      if (avatar !== undefined) {
        metaUpdates.avatar = avatar;
      }
      await supabaseAdmin.auth.admin.updateUserById(sessionUser.id, {
        user_metadata: metaUpdates,
      });
    } catch (e) {}

    // 3. Upsert into public.users using the verified sessionUser.id and sessionUser.email
    let data = null;
    try {
      const upsertPayload: Record<string, any> = {
        id: sessionUser.id,
        name: userName,
        email: (sessionUser.email || "").trim().toLowerCase(),
        campus_id: defaultCampusId,
        campus_name: resolvedCampusName,
        city: resolvedCity,
        department: resolvedDept,
        year_of_study: resolvedYear,
        phone: resolvedPhone,
        verification_status: resolvedVerification,
        monthly_income:
          monthly_income !== undefined ? monthly_income : null,
      };
      if (normalizedStudentId !== undefined) {
        upsertPayload.student_id = normalizedStudentId;
      }
      if (avatar !== undefined) {
        upsertPayload.avatar = avatar;
      }

      const res = await supabaseAdmin
        .from("users")
        .upsert(upsertPayload, { onConflict: "id" })
        .select()
        .single();
      data = res.data;
    } catch (upsertErr) {
      // Fallback in case extended columns aren't yet added to table
      try {
        const fallbackPayload: Record<string, any> = {
          id: sessionUser.id,
          name: userName,
          email: (sessionUser.email || "").trim().toLowerCase(),
          campus_id: defaultCampusId,
          monthly_income:
            monthly_income !== undefined ? monthly_income : null,
        };
        if (avatar !== undefined) {
          fallbackPayload.avatar = avatar;
        }

        const fallbackRes = await supabaseAdmin
          .from("users")
          .upsert(fallbackPayload, { onConflict: "id" })
          .select()
          .single();
        data = fallbackRes.data;
      } catch (e) {}
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

