import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { fetchUserNotifications, markNotificationsRead } from "@/lib/notification-service";

const privateResponse = { "Cache-Control": "private, no-store" };

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return NextResponse.json({ notifications: [] }, { status: 401, headers: privateResponse });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ notifications: [] }, { status: 503, headers: privateResponse });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const notifications = await fetchUserNotifications(supabaseAdmin, userId);
    return NextResponse.json({ notifications }, { headers: privateResponse });
  } catch {
    return NextResponse.json({ notifications: [] }, { status: 500, headers: privateResponse });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { action, id } = await req.json().catch(() => ({}));

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Notifications are temporarily unavailable." }, { status: 503 });
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
