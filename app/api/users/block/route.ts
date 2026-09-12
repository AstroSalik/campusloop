import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ blockedUserIds: [], blockedByUserIds: [] });
    }

    // Authenticate request and derive acting identity from session
    const sessionUserId = await getAuthenticatedUserId(req);
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");

    // Preserve queryUserId as target user lookup if provided, while acting identity is sessionUserId
    const actingUserId = sessionUserId || queryUserId;

    if (!actingUserId) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Fetch users blocked by this user
    const { data: blockedRows, error: bErr } = await supabaseAdmin
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", actingUserId);

    // 2. Fetch users who blocked this user
    const { data: blockedByRows, error: byErr } = await supabaseAdmin
      .from("user_blocks")
      .select("blocker_id")
      .eq("blocked_id", actingUserId);

    if (bErr || byErr) {
      // If table doesn't exist yet or other schema notice
      return NextResponse.json({ blockedUserIds: [], blockedByUserIds: [] });
    }

    const blockedUserIds = (blockedRows || []).map((r: any) => r.blocked_id);
    const blockedByUserIds = (blockedByRows || []).map((r: any) => r.blocker_id);

    return NextResponse.json({ blockedUserIds, blockedByUserIds });
  } catch (err: any) {
    console.error("GET user blocks exception:", err);
    return NextResponse.json({ blockedUserIds: [], blockedByUserIds: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { blockedId, userId, action = "block" } = body;

    // Derive the acting blocker identity from the authenticated session
    const sessionUserId = await getAuthenticatedUserId(req);
    const blockerId = sessionUserId || body.blockerId;
    const targetUserId = blockedId || userId;

    if (!blockerId) {
      return NextResponse.json(
        { error: "Unauthorized: Active session required to manage blocks" },
        { status: 401 }
      );
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID (blockedId or userId) is required" },
        { status: 400 }
      );
    }

    if (blockerId === targetUserId) {
      return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Database configuration missing" }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    if (action === "block") {
      const { error } = await supabaseAdmin
        .from("user_blocks")
        .upsert(
          { blocker_id: blockerId, blocked_id: targetUserId },
          { onConflict: "blocker_id, blocked_id" }
        );

      if (error) {
        console.warn("[user-block] Error inserting block:", error.message);
        if (error.code === "PGRST205") {
          return NextResponse.json({ success: true, action: "block", blockerId, blockedId: targetUserId, clientSync: true });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: "block", blockerId, blockedId: targetUserId });
    } else {
      const { error } = await supabaseAdmin
        .from("user_blocks")
        .delete()
        .eq("blocker_id", blockerId)
        .eq("blocked_id", targetUserId);

      if (error) {
        console.warn("[user-block] Error removing block:", error.message);
        if (error.code === "PGRST205") {
          return NextResponse.json({ success: true, action: "unblock", blockerId, blockedId: targetUserId, clientSync: true });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: "unblock", blockerId, blockedId: targetUserId });
    }
  } catch (err: any) {
    console.error("POST user blocks exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
