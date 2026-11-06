import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { fetchUserNotifications, markNotificationsRead } from "@/lib/notification-service";

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

    const notifications = await fetchUserNotifications(supabaseAdmin, userId);
    return NextResponse.json({ notifications });
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

    if (action === "mark_read" && id) {
      await markNotificationsRead(supabaseAdmin, userId, id);
    } else if (action === "mark_all_read") {
      await markNotificationsRead(supabaseAdmin, userId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
