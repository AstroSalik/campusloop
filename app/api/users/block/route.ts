import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId parameter is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ blockedUserIds: [], blockedByUserIds: [] });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Fetch users blocked by this user
    const { data: blockedRows, error: bErr } = await supabaseAdmin
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", userId);

    // 2. Fetch users who blocked this user
    const { data: blockedByRows, error: byErr } = await supabaseAdmin
      .from("user_blocks")
      .select("blocker_id")
      .eq("blocked_id", userId);

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
    const { blockerId, blockedId, action = "block" } = body;

    if (!blockerId || !blockedId) {
      return NextResponse.json(
        { error: "blockerId and blockedId are required" },
        { status: 400 }
      );
    }

    if (blockerId === blockedId) {
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
          { blocker_id: blockerId, blocked_id: blockedId },
          { onConflict: "blocker_id, blocked_id" }
        );

      if (error) {
        console.warn("[user-block] Error inserting block:", error.message);
        if (error.code === "PGRST205") {
          return NextResponse.json({ success: true, action: "block", blockerId, blockedId, clientSync: true });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: "block", blockerId, blockedId });
    } else {
      const { error } = await supabaseAdmin
        .from("user_blocks")
        .delete()
        .eq("blocker_id", blockerId)
        .eq("blocked_id", blockedId);

      if (error) {
        console.warn("[user-block] Error removing block:", error.message);
        if (error.code === "PGRST205") {
          return NextResponse.json({ success: true, action: "unblock", blockerId, blockedId, clientSync: true });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: "unblock", blockerId, blockedId });
    }
  } catch (err: any) {
    console.error("POST user blocks exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
