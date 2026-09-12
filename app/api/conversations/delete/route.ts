import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { conversationId, userId, deleteForEveryone = false } = body;

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase service configuration missing" }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    if (deleteForEveryone) {
      // Telegram: Delete for both of them (entire chat & history removed for all)
      const { error: msgErr } = await supabaseAdmin
        .from("messages")
        .delete()
        .eq("conversation_id", conversationId);

      if (msgErr) {
        console.warn("[delete-conversation] Error deleting messages:", msgErr.message);
      }

      const { error: memErr } = await supabaseAdmin
        .from("conversation_members")
        .delete()
        .eq("conversation_id", conversationId);

      if (memErr) {
        console.warn("[delete-conversation] Error deleting conversation_members:", memErr.message);
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
      // Telegram: Delete for me only (removes current user from conversation, leaves thread for the other student)
      if (userId) {
        const { error: memErr } = await supabaseAdmin
          .from("conversation_members")
          .delete()
          .eq("conversation_id", conversationId)
          .eq("user_id", userId);

        if (memErr) {
          console.warn("[delete-conversation] Notice deleting member for-me:", memErr.message);
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
