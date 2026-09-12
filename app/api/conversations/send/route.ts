import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, conversationId, senderId, content, created_at } = body;

    if (!id || !conversationId || !senderId || !content) {
      return NextResponse.json(
        { error: "Missing required fields (id, conversationId, senderId, content)" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase service configuration missing" }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Check if any recipient has blocked sender or if sender has blocked recipient
    try {
      const { data: members } = await supabaseAdmin
        .from("conversation_members")
        .select("user_id")
        .eq("conversation_id", conversationId);

      const otherUserIds = (members || [])
        .map((m: any) => m.user_id)
        .filter((uid: string) => uid !== senderId);

      if (otherUserIds.length > 0) {
        const { data: blockRows } = await supabaseAdmin
          .from("user_blocks")
          .select("blocker_id, blocked_id")
          .or(
            `and(blocker_id.eq.${senderId},blocked_id.in.(${otherUserIds.join(",")})),and(blocked_id.eq.${senderId},blocker_id.in.(${otherUserIds.join(",")}))`
          );

        if (blockRows && blockRows.length > 0) {
          const iBlocked = blockRows.some((b: any) => b.blocker_id === senderId);
          if (iBlocked) {
            return NextResponse.json(
              { error: "You have blocked this student. Unblock them to send messages." },
              { status: 403 }
            );
          }
          return NextResponse.json(
            { error: "You cannot send messages to this student because they have blocked you." },
            { status: 403 }
          );
        }
      }
    } catch (e) {
      // Graceful fallback if table is not yet migrated
    }

    const timestamp = created_at || new Date().toISOString();

    const { error: msgErr } = await supabaseAdmin.from("messages").insert({
      id,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: timestamp,
    });

    if (msgErr) {
      console.error("[send-message] Error inserting message:", msgErr.message);
      return NextResponse.json({ error: msgErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: {
        id,
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        created_at: timestamp,
      },
    });
  } catch (err: any) {
    console.error("Send message exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during message sending" },
      { status: 500 }
    );
  }
}
