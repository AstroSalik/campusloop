import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, conversationId } = body;
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!id || !conversationId || !content || content.length > 2000) {
      return NextResponse.json(
        { error: "Enter a message of up to 2,000 characters." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase service configuration missing" }, { status: 500 });
    }

    // 1. Derive sender identity from authenticated session
    const { data: { user } } = await createServerClient().auth.getUser();
    const authenticatedSenderId = user?.id;

    if (!authenticatedSenderId) {
      return NextResponse.json(
        { error: "Unauthorized: Active session required to send messages" },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 2. Verify that the authenticated user is a member of the conversation
    const { data: members, error: memErr } = await supabaseAdmin
      .from("conversation_members")
      .select("user_id")
      .eq("conversation_id", conversationId);

    if (memErr) {
      console.warn("[send-message] Error fetching members:", memErr.message);
    }

    const isMember = (members || []).some((m: any) => m.user_id === authenticatedSenderId);
    if (!isMember) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this conversation" },
        { status: 403 }
      );
    }

    // 3. Check if any recipient has blocked sender or if sender has blocked recipient
    try {
      const otherUserIds = (members || [])
        .map((m: any) => m.user_id)
        .filter((uid: string) => uid !== authenticatedSenderId);

      if (otherUserIds.length > 0) {
        const { data: blockRows } = await supabaseAdmin
          .from("user_blocks")
          .select("blocker_id, blocked_id")
          .or(
            `and(blocker_id.eq.${authenticatedSenderId},blocked_id.in.(${otherUserIds.join(",")})),and(blocked_id.eq.${authenticatedSenderId},blocker_id.in.(${otherUserIds.join(",")}))`
          );

        if (blockRows && blockRows.length > 0) {
          const iBlocked = blockRows.some((b: any) => b.blocker_id === authenticatedSenderId);
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

    const timestamp = new Date().toISOString();

    const { error: msgErr } = await supabaseAdmin.from("messages").insert({
      id,
      conversation_id: conversationId,
      sender_id: authenticatedSenderId,
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
        sender_id: authenticatedSenderId,
        content,
        created_at: timestamp,
      },
    });
  } catch (err: any) {
    console.error("Send message exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
