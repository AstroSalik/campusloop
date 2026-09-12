import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { conversation, members, initialMessage } = body;

    if (!conversation?.id || !conversation?.type) {
      return NextResponse.json(
        { error: "Invalid conversation payload" },
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

    // 1. Check if conversation already exists
    const { data: existing } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("id", conversation.id)
      .maybeSingle();

    if (!existing) {
      // Normalize type to DB constraints ('marketplace_dm', 'housing_group', 'roommate_dm')
      let dbType = conversation.type;
      if (dbType !== "housing_group" && dbType !== "roommate_dm") {
        dbType = "marketplace_dm";
      }

      const { error: convErr } = await supabaseAdmin.from("conversations").insert({
        id: conversation.id,
        listing_id: conversation.listing_id || null,
        room_id: conversation.room_id || null,
        wanted_listing_id: conversation.wanted_listing_id || null,
        type: dbType,
      });

      if (convErr) {
        console.error("[create-conversation] Error inserting conversation:", convErr.message);
      }
    }

    // 2. Insert members
    if (Array.isArray(members) && members.length > 0) {
      const memberRows = members.map((m: any) => ({
        conversation_id: conversation.id,
        user_id: m.user_id,
        role: m.role || "member",
      }));

      try {
        await supabaseAdmin
          .from("conversation_members")
          .upsert(memberRows, { onConflict: "conversation_id, user_id" as any });
      } catch (err) {
        console.warn("[create-conversation] Notice on members upsert:", err);
      }
    }

    // 3. Insert initial message if provided
    if (initialMessage?.id && initialMessage?.content) {
      const { data: existingMsg } = await supabaseAdmin
        .from("messages")
        .select("id")
        .eq("id", initialMessage.id)
        .maybeSingle();

      if (!existingMsg) {
        await supabaseAdmin.from("messages").insert({
          id: initialMessage.id,
          conversation_id: conversation.id,
          sender_id: initialMessage.sender_id,
          content: initialMessage.content,
          created_at: initialMessage.created_at || new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true, conversationId: conversation.id });
  } catch (err: any) {
    console.error("Create conversation exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during conversation creation" },
      { status: 500 }
    );
  }
}
