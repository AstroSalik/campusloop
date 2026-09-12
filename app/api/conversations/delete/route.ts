import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { conversationId, userId: bodyUserId, deleteForEveryone = false } = body;

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase service configuration missing" }, { status: 500 });
    }

    // 1. Resolve authenticated user identity server-side
    const sessionUserId = await getAuthenticatedUserId(req);
    const effectiveUserId = sessionUserId || bodyUserId;

    if (!effectiveUserId) {
      return NextResponse.json(
        { error: "Unauthorized: Active session or userId required" },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 2. Verify that the user is a member of the requested conversation
    const { data: memberRecord, error: checkMemErr } = await supabaseAdmin
      .from("conversation_members")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", effectiveUserId)
      .maybeSingle();

    if (checkMemErr) {
      console.warn("[delete-conversation] Membership check error:", checkMemErr.message);
    }

    if (!memberRecord) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this conversation" },
        { status: 403 }
      );
    }

    if (deleteForEveryone) {
      // Telegram: Delete for both of them (entire chat & history removed for all)
      const { error: msgErr } = await supabaseAdmin
        .from("messages")
        .delete()
        .eq("conversation_id", conversationId);

      if (msgErr) {
        console.error("[delete-conversation] Error deleting messages:", msgErr.message);
        return NextResponse.json({ error: msgErr.message }, { status: 500 });
      }

      const { error: memErr } = await supabaseAdmin
        .from("conversation_members")
        .delete()
        .eq("conversation_id", conversationId);

      if (memErr) {
        console.error("[delete-conversation] Error deleting conversation_members:", memErr.message);
        return NextResponse.json({ error: memErr.message }, { status: 500 });
      }

      const { error: convErr } = await supabaseAdmin
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (convErr) {
        console.error("[delete-conversation] Error deleting conversation:", convErr.message);
        return NextResponse.json({ error: convErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, conversationId, deletedFor: "everyone" });
    } else {
      // Telegram: Delete for me only (removes current user from conversation)
      if (!effectiveUserId) {
        return NextResponse.json(
          { error: "userId is required when deleteForEveryone is false" },
          { status: 400 }
        );
      }

      const { error: memErr } = await supabaseAdmin
        .from("conversation_members")
        .delete()
        .eq("conversation_id", conversationId)
        .eq("user_id", effectiveUserId);

      if (memErr) {
        console.error("[delete-conversation] Error deleting membership for-me:", memErr.message);
        return NextResponse.json({ error: memErr.message }, { status: 500 });
      }

      // Check if any members remain
      const { count } = await supabaseAdmin
        .from("conversation_members")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conversationId);

      // If no one is left in the conversation, clean up completely
      if (count === 0) {
        await supabaseAdmin.from("messages").delete().eq("conversation_id", conversationId);
        await supabaseAdmin.from("conversations").delete().eq("id", conversationId);
      }

      return NextResponse.json({ success: true, conversationId, deletedFor: "me" });
    }
  } catch (err: any) {
    console.error("Delete conversation exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during conversation deletion" },
      { status: 500 }
    );
  }
}
