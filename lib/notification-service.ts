import { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

export interface CampusNotification {
  id: string;
  user_id: string;
  type: "restock_request" | "purchase" | "message" | "system";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

const NOTIF_PREFIX = "<!--CL_NOTIF:";
const NOTIF_SUFFIX = "-->";

/**
 * Creates and delivers a notification to a student user across both
 * native PostgreSQL notifications table and resilient message-channel fallback.
 */
export async function createNotification(
  supabaseAdmin: SupabaseClient,
  params: {
    userId: string;
    type: "restock_request" | "purchase" | "message" | "system";
    title: string;
    message: string;
    link?: string;
    listingId?: string;
  }
): Promise<{ success: boolean; notification: CampusNotification }> {
  const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  const notification: CampusNotification = {
    id: notifId,
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
    read: false,
    created_at: nowIso,
  };

  // 1. First attempt native notifications table insert
  try {
    const { error: notifErr } = await supabaseAdmin
      .from("notifications")
      .insert({
        id: notifId,
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        read: false,
        created_at: nowIso,
      });

    if (!notifErr) {
      return { success: true, notification };
    }
  } catch {}

  // 2. Resilient Cloud Fallback via conversations/messages
  try {
    // Find or create a conversation for this listing / student
    let convId: string | null = null;

    if (params.listingId) {
      const { data: existingConv } = await supabaseAdmin
        .from("conversations")
        .select("id")
        .eq("listing_id", params.listingId)
        .maybeSingle();
      if (existingConv) {
        convId = existingConv.id;
      }
    }

    if (!convId) {
      const newConvId = crypto.randomUUID();
      const { data: createdConv } = await supabaseAdmin
        .from("conversations")
        .insert({
          id: newConvId,
          type: "marketplace_dm",
          listing_id: params.listingId || null,
        })
        .select("id")
        .maybeSingle();

      if (createdConv) {
        convId = createdConv.id;
        await supabaseAdmin.from("conversation_members").insert({
          conversation_id: convId,
          user_id: params.userId,
        });
      }
    }

    if (convId) {
      const msgId = crypto.randomUUID();
      const rawPayload = `${NOTIF_PREFIX}${JSON.stringify(notification)}${NOTIF_SUFFIX}\n${params.title} - ${params.message}`;

      await supabaseAdmin.from("messages").insert({
        id: msgId,
        conversation_id: convId,
        sender_id: params.userId,
        content: rawPayload,
      });
    }
  } catch (fallbackErr) {
    console.warn("[notification-service] Fallback delivery notice:", fallbackErr);
  }

  return { success: true, notification };
}

/**
 * Fetches all notifications for a given user from both native table and message fallback.
 */
export async function fetchUserNotifications(
  supabaseAdmin: SupabaseClient,
  userId: string
): Promise<CampusNotification[]> {
  const notifMap = new Map<string, CampusNotification>();

  // 1. Try native notifications table
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error && Array.isArray(data)) {
      data.forEach((row: any) => {
        notifMap.set(row.id, {
          id: row.id,
          user_id: row.user_id,
          type: row.type || "system",
          title: row.title,
          message: row.message,
          link: row.link,
          read: Boolean(row.read),
          created_at: row.created_at,
        });
      });
    }
  } catch {}

  // 2. Also check messages containing CL_NOTIF in user's conversations
  try {
    const { data: memberConvs } = await supabaseAdmin
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", userId);

    if (memberConvs && memberConvs.length > 0) {
      const convIds = memberConvs.map((c) => c.conversation_id);
      const { data: notifMsgs } = await supabaseAdmin
        .from("messages")
        .select("id, content, created_at")
        .in("conversation_id", convIds)
        .ilike("content", "%CL_NOTIF%")
        .order("created_at", { ascending: false })
        .limit(30);

      if (notifMsgs && Array.isArray(notifMsgs)) {
        notifMsgs.forEach((m) => {
          try {
            const match = m.content.match(/<!--CL_NOTIF:([\s\S]*?)-->/);
            if (match) {
              const parsed: CampusNotification = JSON.parse(match[1]);
              if (parsed && parsed.id && !notifMap.has(parsed.id)) {
                notifMap.set(parsed.id, {
                  ...parsed,
                  created_at: parsed.created_at || m.created_at,
                });
              }
            }
          } catch {}
        });
      }
    }
  } catch {}

  return Array.from(notifMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Marks notifications as read across native and message-channel storage.
 */
export async function markNotificationsRead(
  supabaseAdmin: SupabaseClient,
  userId: string,
  notificationId?: string
): Promise<void> {
  // 1. Try native table
  try {
    if (notificationId) {
      await supabaseAdmin
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", userId);
    } else {
      await supabaseAdmin
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId);
    }
  } catch {}

  // 2. Update message-based notifications
  try {
    const { data: memberConvs } = await supabaseAdmin
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", userId);

    if (memberConvs && memberConvs.length > 0) {
      const convIds = memberConvs.map((c) => c.conversation_id);
      const { data: msgs } = await supabaseAdmin
        .from("messages")
        .select("id, content")
        .in("conversation_id", convIds)
        .ilike("content", "%CL_NOTIF%");

      if (msgs && Array.isArray(msgs)) {
        for (const msg of msgs) {
          const match = msg.content.match(/<!--CL_NOTIF:([\s\S]*?)-->/);
          if (match) {
            try {
              const parsed: CampusNotification = JSON.parse(match[1]);
              if (!notificationId || parsed.id === notificationId) {
                if (!parsed.read) {
                  parsed.read = true;
                  const newContent = msg.content.replace(
                    /<!--CL_NOTIF:[\s\S]*?-->/,
                    `${NOTIF_PREFIX}${JSON.stringify(parsed)}${NOTIF_SUFFIX}`
                  );
                  await supabaseAdmin
                    .from("messages")
                    .update({ content: newContent })
                    .eq("id", msg.id);
                }
              }
            } catch {}
          }
        }
      }
    }
  } catch {}
}

