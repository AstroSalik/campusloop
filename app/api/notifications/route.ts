import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    const userId = (await getAuthenticatedUserId(req)) || queryUserId;

    if (!userId) {
      return NextResponse.json({ notifications: [] });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ notifications: [] });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    try {
      const { data, error } = await supabaseAdmin
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!error && data) {
        return NextResponse.json({ notifications: data });
      }
    } catch {
      // Table may not exist yet
    }

    return NextResponse.json({ notifications: [] });
  } catch (err: any) {
    return NextResponse.json({ notifications: [], error: err?.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, id, userId: bodyUserId } = body;
    const userId = (await getAuthenticatedUserId(req)) || bodyUserId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: true });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    try {
      if (action === "mark_read" && id) {
        await supabaseAdmin
          .from("notifications")
          .update({ read: true })
          .eq("id", id)
          .eq("user_id", userId);
      } else if (action === "mark_all_read") {
        await supabaseAdmin
          .from("notifications")
          .update({ read: true })
          .eq("user_id", userId);
      }
    } catch {
      // Ignore if table pending migration
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
