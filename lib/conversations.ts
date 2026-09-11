import { Conversation, ConversationMember, Message } from "@/lib/types";
import { DEMO_USERS, getClientDemoSession, getDemoUserById, PRIMARY_DEMO_USER } from "@/lib/auth";
import { getListingById } from "@/lib/marketplace-data";
import { getRoomById } from "@/lib/housing-data";
import { getWantedListingById } from "@/lib/wanted-data";
import { createClient } from "@/lib/supabase/client";

export interface StoredConversation extends Conversation {
  members: (ConversationMember & { user_name: string; user_email: string; user_initials: string })[];
  messages: Message[];
  title?: string;
  subtitle?: string;
}

const STORAGE_KEY = "campusloop_conversations";

// Standard RFC4122 v4 UUID generator (Postgres uuid compliant)
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return "CS";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Robust user resolver: avoids hardcoding to Salik Riyaz.
 * Uses explicit hints, active session, demo users, or queries Supabase public.users.
 */
export async function resolveUserForChat(
  userId: string,
  hints?: { name?: string; email?: string }
): Promise<{ id: string; name: string; email: string; initials: string }> {
  // 1. If hints have name provided, prioritize them
  if (hints?.name && hints.name.trim()) {
    return {
      id: userId,
      name: hints.name.trim(),
      email: hints.email?.trim() || "",
      initials: getInitials(hints.name),
    };
  }

  // 2. Check current browser session
  const currentSession = getClientDemoSession();
  if (currentSession && currentSession.id === userId) {
    return {
      id: currentSession.id,
      name: currentSession.name,
      email: currentSession.email || "",
      initials: currentSession.initials || getInitials(currentSession.name),
    };
  }

  // 3. Check demo users list
  const demoUser = getDemoUserById(userId);
  if (demoUser) {
    return {
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email || "",
      initials: demoUser.initials || getInitials(demoUser.name),
    };
  }

  // 4. Query Supabase public.users table
  if (typeof window !== "undefined" && userId) {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("id", userId)
        .maybeSingle();

      if (data && data.name) {
        return {
          id: data.id,
          name: data.name,
          email: data.email || "",
          initials: getInitials(data.name),
        };
      }
    } catch (e) {
      // ignore network errors
    }
  }

  // 5. Fallback preserving the actual userId!
  const fallbackName = hints?.name || (userId ? `Student (${userId.slice(0, 4)})` : "Campus Student");
  return {
    id: userId,
    name: fallbackName,
    email: hints?.email || "",
    initials: getInitials(fallbackName),
  };
}

export function getLatestTimestamp(c: StoredConversation): number {
  if (c.messages && c.messages.length > 0) {
    const lastMsg = c.messages[c.messages.length - 1];
    return new Date(lastMsg.created_at).getTime();
  }
  return new Date(c.created_at).getTime();
}

export function getConversations(): StoredConversation[] {
  let list: StoredConversation[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        let parsed: StoredConversation[] = JSON.parse(raw);

        // Self-heal and sanitize legacy conversations
        const currentSession = getClientDemoSession();
        parsed = parsed.map((c) => {
          let members = c.members || [];

          // Self-heal members if both were accidentally set to Salik Riyaz
          if (
            currentSession &&
            members.length === 2 &&
            members[0].user_id === members[1].user_id &&
            members[0].user_id !== currentSession.id
          ) {
            // Find if this was a buyer conversation
            if (c.id.includes(currentSession.id) || (c.type === "marketplace_dm" && members[1].role === "buyer")) {
              members[1] = {
                ...members[1],
                user_id: currentSession.id,
                user_name: currentSession.name,
                user_email: currentSession.email,
                user_initials: currentSession.initials || getInitials(currentSession.name),
              };
            }
          }

          const cleanedTitle =
            c.title?.includes("undefined") || c.title === "Marketplace Listing"
              ? c.members.find((m) => m.role === "seller")?.user_name
                ? `${c.members.find((m) => m.role === "seller")?.user_name} (Roommate)`
                : "CampusLoop Chat"
              : c.title;

          const cleanedSubtitle =
            c.subtitle?.includes("undefined") || c.subtitle === "Campus • ₹"
              ? "Demo Campus Student"
              : c.subtitle;

          const cleanedMessages = (c.messages || []).map((m) => {
            if (m.content && m.content.includes("undefined")) {
              return {
                ...m,
                content: m.content.replace('"undefined"', "your listing").replace(': "undefined".', "."),
              };
            }
            return m;
          });

          return {
            ...c,
            members,
            title: cleanedTitle,
            subtitle: cleanedSubtitle,
            messages: cleanedMessages,
          };
        });

        list = parsed;
      }
    } catch (e) {}
  }

  // Always sort by latest activity timestamp (newest message on top)
  return list.sort((a, b) => getLatestTimestamp(b) - getLatestTimestamp(a));
}

export function getConversationById(id: string): StoredConversation | undefined {
  const all = getConversations();
  return all.find((c) => c.id === id);
}

export function saveConversations(convs: StoredConversation[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
      window.dispatchEvent(new Event("campusloop_conversations_updated"));
    } catch (e) {}
  }
}

/**
 * Flow A: Marketplace purchase interest -> Unified Chat Auto-Creation
 */
export async function getOrCreateMarketplaceConversation(
  listingId: string,
  buyerId: string,
  sellerId: string,
  extraHints?: {
    buyerName?: string;
    buyerEmail?: string;
    sellerName?: string;
    sellerEmail?: string;
    listingTitle?: string;
    price?: number;
    location?: string;
  }
): Promise<string> {
  const all = getConversations();

  // 1. Check local cache if conversation already exists for this listing + buyer
  const existingLocal = all.find(
    (c) =>
      c.type === "marketplace_dm" &&
      c.listing_id === listingId &&
      c.members.some((m) => m.user_id === buyerId)
  );

  if (existingLocal) {
    return existingLocal.id;
  }

  // 2. Check Supabase for existing conversation
  try {
    const supabase = createClient();
    const { data: convData } = await supabase
      .from("conversations")
      .select("id, listing_id, type, conversation_members(user_id, role)")
      .eq("listing_id", listingId)
      .eq("type", "marketplace_dm");

    if (convData && convData.length > 0) {
      const match = convData.find((c: any) =>
        c.conversation_members?.some((m: any) => m.user_id === buyerId)
      );
      if (match) {
        return match.id;
      }
    }
  } catch (e) {
    // continue to create
  }

  // 3. Resolve Buyer and Seller with accurate user identities
  const buyer = await resolveUserForChat(buyerId, {
    name: extraHints?.buyerName,
    email: extraHints?.buyerEmail,
  });

  const listing = getListingById(listingId);
  const seller = await resolveUserForChat(sellerId || listing?.seller_id || "", {
    name: extraHints?.sellerName || listing?.seller_name,
    email: extraHints?.sellerEmail || listing?.seller_email,
  });

  // Generate standard valid UUID for Supabase
  const newConvId = generateUUID();
  const initialMsgId = generateUUID();

  const listingTitle = extraHints?.listingTitle || listing?.title || "Marketplace Item";
  const listingSubtitle =
    extraHints?.price != null && extraHints?.location
      ? `${extraHints.location} • ₹${extraHints.price.toLocaleString("en-IN")}`
      : listing
      ? `${listing.location_label} • ₹${listing.price.toLocaleString("en-IN")}`
      : "Campus Marketplace";

  const initialMsg = `Hi ${seller.name}, I'm interested in your listing: "${listingTitle}". Is it still available?`;

  const newConv: StoredConversation = {
    id: newConvId,
    listing_id: listingId,
    room_id: null,
    wanted_listing_id: null,
    type: "marketplace_dm",
    created_at: new Date().toISOString(),
    title: listingTitle,
    subtitle: listingSubtitle,
    members: [
      {
        conversation_id: newConvId,
        user_id: seller.id,
        role: "seller",
        user_name: seller.name,
        user_email: seller.email,
        user_initials: seller.initials,
      },
      {
        conversation_id: newConvId,
        user_id: buyer.id,
        role: "buyer",
        user_name: buyer.name,
        user_email: buyer.email,
        user_initials: buyer.initials,
      },
    ],
    messages: [
      {
        id: initialMsgId,
        conversation_id: newConvId,
        sender_id: buyer.id,
        content: initialMsg,
        created_at: new Date().toISOString(),
      },
    ],
  };

  // 4. Persist to Supabase
  try {
    const supabase = createClient();
    const { error: convErr } = await supabase.from("conversations").insert({
      id: newConvId,
      listing_id: listingId,
      type: "marketplace_dm",
    });

    if (convErr) {
      console.error("[Supabase Error] Marketplace conversation insert failed:", convErr);
    }

    const { error: memErr } = await supabase.from("conversation_members").insert([
      { conversation_id: newConvId, user_id: seller.id, role: "seller" },
      { conversation_id: newConvId, user_id: buyer.id, role: "buyer" },
    ]);
    if (memErr) {
      console.error("[Supabase Error] Marketplace members insert failed:", memErr);
    }

    const { error: msgErr } = await supabase.from("messages").insert({
      id: initialMsgId,
      conversation_id: newConvId,
      sender_id: buyer.id,
      content: initialMsg,
    });
    if (msgErr) {
      console.error("[Supabase Error] Marketplace initial message insert failed:", msgErr);
    }
  } catch (e) {
    console.error("[Network Exception] Supabase marketplace conversation creation:", e);
  }

  saveConversations([newConv, ...all]);
  return newConvId;
}

/**
 * Direct Roommate Connection Conversation
 */
export async function getOrCreateRoommateConversation(
  initiatorId: string,
  targetUserId: string,
  extraHints?: {
    initiatorName?: string;
    initiatorEmail?: string;
    targetName?: string;
    targetEmail?: string;
  }
): Promise<string> {
  const all = getConversations();

  // Check local cache
  const existing = all.find(
    (c) =>
      (c.type === "roommate_dm" || (c.type === "marketplace_dm" && !c.listing_id && !c.room_id)) &&
      c.members.some((m) => m.user_id === initiatorId) &&
      c.members.some((m) => m.user_id === targetUserId)
  );

  if (existing) {
    return existing.id;
  }

  const initiator = await resolveUserForChat(initiatorId, {
    name: extraHints?.initiatorName,
    email: extraHints?.initiatorEmail,
  });

  const target = await resolveUserForChat(targetUserId, {
    name: extraHints?.targetName,
    email: extraHints?.targetEmail,
  });

  const newConvId = generateUUID();
  const initialMsgId = generateUUID();
  const initialMsg = `Hi ${target.name}, I saw your roommate profile on CampusLoop and would love to connect about finding a place together!`;

  const newConv: StoredConversation = {
    id: newConvId,
    listing_id: null,
    room_id: null,
    wanted_listing_id: null,
    type: "roommate_dm",
    created_at: new Date().toISOString(),
    title: `${target.name} (Roommate)`,
    subtitle: "Campus Roommate Finder",
    members: [
      {
        conversation_id: newConvId,
        user_id: target.id,
        role: "seller",
        user_name: target.name,
        user_email: target.email,
        user_initials: target.initials,
      },
      {
        conversation_id: newConvId,
        user_id: initiator.id,
        role: "buyer",
        user_name: initiator.name,
        user_email: initiator.email,
        user_initials: initiator.initials,
      },
    ],
    messages: [
      {
        id: initialMsgId,
        conversation_id: newConvId,
        sender_id: initiator.id,
        content: initialMsg,
        created_at: new Date().toISOString(),
      },
    ],
  };

  try {
    const supabase = createClient();
    await supabase.from("conversations").insert({
      id: newConvId,
      type: "roommate_dm",
    });
    await supabase.from("conversation_members").insert([
      { conversation_id: newConvId, user_id: target.id, role: "seller" },
      { conversation_id: newConvId, user_id: initiator.id, role: "buyer" },
    ]);
    await supabase.from("messages").insert({
      id: initialMsgId,
      conversation_id: newConvId,
      sender_id: initiator.id,
      content: initialMsg,
    });
  } catch (e) {
    console.error("[Network Exception] Roommate conversation creation:", e);
  }

  saveConversations([newConv, ...all]);
  return newConvId;
}

/**
 * Flow B: Room interest -> Auto Group Chat (Single thread per room_id)
 */
export async function getOrCreateRoomConversation(
  roomId: string,
  userId: string,
  ownerId?: string,
  extraHints?: {
    userName?: string;
    userEmail?: string;
    ownerName?: string;
    ownerEmail?: string;
    roomTitle?: string;
    rent?: number;
    location?: string;
  }
): Promise<string> {
  const all = getConversations();
  const room = getRoomById(roomId);

  const user = await resolveUserForChat(userId, {
    name: extraHints?.userName,
    email: extraHints?.userEmail,
  });

  const owner = await resolveUserForChat(ownerId || room?.owner_id || "", {
    name: extraHints?.ownerName || room?.owner?.name,
    email: extraHints?.ownerEmail || room?.owner?.email,
  });

  // 1. Check if a housing_group conversation already exists for this room_id
  let existing = all.find((c) => c.type === "housing_group" && c.room_id === roomId);

  if (!existing) {
    // Check Supabase
    try {
      const supabase = createClient();
      const { data: convData } = await supabase
        .from("conversations")
        .select("id, room_id, type")
        .eq("room_id", roomId)
        .eq("type", "housing_group")
        .maybeSingle();

      if (convData) {
        existing = {
          id: convData.id,
          room_id: roomId,
          listing_id: null,
          wanted_listing_id: null,
          type: "housing_group",
          created_at: new Date().toISOString(),
          title: `${extraHints?.roomTitle || room?.title || "Housing"} (Roommates Group)`,
          subtitle: `${extraHints?.location || room?.location_label || "Campus"} • Roommates Group`,
          members: [],
          messages: [],
        };
      }
    } catch (e) {}
  }

  if (existing) {
    const isMember = existing.members.some((m) => m.user_id === user.id);
    if (!isMember) {
      const newMember = {
        conversation_id: existing.id,
        user_id: user.id,
        role: "prospective_roommate" as const,
        user_name: user.name,
        user_email: user.email,
        user_initials: user.initials,
      };
      existing.members.push(newMember);

      const joinMsgId = generateUUID();
      const joinMsgContent = `Hi everyone, I'm interested in this room (${extraHints?.roomTitle || room?.title || "Accommodation"}) and would like to join the roommate group!`;
      existing.messages.push({
        id: joinMsgId,
        conversation_id: existing.id,
        sender_id: user.id,
        content: joinMsgContent,
        created_at: new Date().toISOString(),
      });

      saveConversations([...all]);

      try {
        const supabase = createClient();
        await supabase.from("conversation_members").insert({
          conversation_id: existing.id,
          user_id: user.id,
          role: "prospective_roommate",
        });
        await supabase.from("messages").insert({
          id: joinMsgId,
          conversation_id: existing.id,
          sender_id: user.id,
          content: joinMsgContent,
        });
      } catch (e) {}
    }
    return existing.id;
  }

  // 2. Create new Housing Group Conversation
  const newConvId = generateUUID();
  const initialMsgId = generateUUID();
  const roomTitle = extraHints?.roomTitle || room?.title || "Housing";
  const initialMsg = `Hi ${owner.name}, I'm interested in "${roomTitle}". Is there still a spot open?`;

  const newConv: StoredConversation = {
    id: newConvId,
    listing_id: null,
    room_id: roomId,
    wanted_listing_id: null,
    type: "housing_group",
    created_at: new Date().toISOString(),
    title: `${roomTitle} (Roommates Group)`,
    subtitle: `${extraHints?.location || room?.location_label || "Campus"} • 2 Members • ₹${extraHints?.rent?.toLocaleString("en-IN") || room?.rent?.toLocaleString("en-IN") || ""}/mo`,
    members: [
      {
        conversation_id: newConvId,
        user_id: owner.id,
        role: "owner",
        user_name: owner.name,
        user_email: owner.email,
        user_initials: owner.initials,
      },
      {
        conversation_id: newConvId,
        user_id: user.id,
        role: "prospective_roommate",
        user_name: user.name,
        user_email: user.email,
        user_initials: user.initials,
      },
    ],
    messages: [
      {
        id: initialMsgId,
        conversation_id: newConvId,
        sender_id: user.id,
        content: initialMsg,
        created_at: new Date().toISOString(),
      },
    ],
  };

  try {
    const supabase = createClient();
    await supabase.from("conversations").insert({
      id: newConvId,
      room_id: roomId,
      type: "housing_group",
    });
    await supabase.from("conversation_members").insert([
      { conversation_id: newConvId, user_id: owner.id, role: "owner" },
      { conversation_id: newConvId, user_id: user.id, role: "prospective_roommate" },
    ]);
    await supabase.from("messages").insert({
      id: initialMsgId,
      conversation_id: newConvId,
      sender_id: user.id,
      content: initialMsg,
    });
  } catch (e) {
    console.error("[Network Exception] Room conversation creation:", e);
  }

  saveConversations([newConv, ...all]);
  return newConvId;
}

/**
 * Flow: Student responds to Wanted Request ("I Can Provide This") -> Auto create or open conversation
 */
export async function getOrCreateWantedConversation(
  wantedListingId: string,
  providerId: string,
  requesterId: string,
  extraHints?: {
    providerName?: string;
    providerEmail?: string;
    requesterName?: string;
    requesterEmail?: string;
    wantedTitle?: string;
    budgetMax?: number;
    category?: string;
  }
): Promise<string> {
  const all = getConversations();

  // 1. Check local cache
  const existing = all.find(
    (c) =>
      c.type === "wanted_response" &&
      c.wanted_listing_id === wantedListingId &&
      c.members.some((m) => m.user_id === providerId)
  );

  if (existing) {
    return existing.id;
  }

  const wanted = getWantedListingById(wantedListingId);
  const provider = await resolveUserForChat(providerId, {
    name: extraHints?.providerName,
    email: extraHints?.providerEmail,
  });

  const requester = await resolveUserForChat(requesterId || wanted?.requester_id || "", {
    name: extraHints?.requesterName || wanted?.requester_name,
    email: extraHints?.requesterEmail || wanted?.requester_email,
  });

  const newConvId = generateUUID();
  const initialMsgId = generateUUID();
  const wantedTitle = extraHints?.wantedTitle || wanted?.title || "Requested Item";
  const budgetMax = extraHints?.budgetMax || wanted?.budget_max || 0;

  const title = `Wanted: ${wantedTitle}`;
  const subtitle = budgetMax > 0 ? `Budget: Up to ₹${budgetMax.toLocaleString("en-IN")}` : "Wanted Item Response";

  const initialMsg = `Hi ${requester.name}, I saw your request for "${wantedTitle}". I have this available and can provide it to you!`;

  const newConv: StoredConversation = {
    id: newConvId,
    listing_id: null,
    room_id: null,
    wanted_listing_id: wantedListingId,
    type: "wanted_response",
    created_at: new Date().toISOString(),
    title,
    subtitle,
    members: [
      {
        conversation_id: newConvId,
        user_id: requester.id,
        role: "buyer",
        user_name: requester.name,
        user_email: requester.email,
        user_initials: requester.initials,
      },
      {
        conversation_id: newConvId,
        user_id: provider.id,
        role: "seller",
        user_name: provider.name,
        user_email: provider.email,
        user_initials: provider.initials,
      },
    ],
    messages: [
      {
        id: initialMsgId,
        conversation_id: newConvId,
        sender_id: provider.id,
        content: initialMsg,
        created_at: new Date().toISOString(),
      },
    ],
  };

  try {
    const supabase = createClient();
    // Database schema constraint accepts ('marketplace_dm', 'housing_group', 'roommate_dm')
    await supabase.from("conversations").insert({
      id: newConvId,
      type: "marketplace_dm",
    });
    await supabase.from("conversation_members").insert([
      { conversation_id: newConvId, user_id: requester.id, role: "buyer" },
      { conversation_id: newConvId, user_id: provider.id, role: "seller" },
    ]);
    await supabase.from("messages").insert({
      id: initialMsgId,
      conversation_id: newConvId,
      sender_id: provider.id,
      content: initialMsg,
    });
  } catch (e) {
    console.error("[Network Exception] Wanted conversation creation:", e);
  }

  saveConversations([newConv, ...all]);
  return newConvId;
}

/**
 * Add a new message to any conversation (Persists to Supabase and local storage)
 */
export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
  const all = getConversations();
  const conv = all.find((c) => c.id === conversationId);

  const messageId = generateUUID();
  const timestamp = new Date().toISOString();

  const newMsg: Message = {
    id: messageId,
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    created_at: timestamp,
  };

  // 1. Update local state immediately (optimistic UI)
  if (conv) {
    if (!conv.messages) conv.messages = [];
    conv.messages.push(newMsg);
    saveConversations([...all]);
  }

  // 2. Real Supabase Database Insert
  try {
    const supabase = createClient();
    const { error } = await supabase.from("messages").insert({
      id: messageId,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: timestamp,
    });

    if (error) {
      console.error("[Supabase Error] sendMessage failed:", error);
    }
  } catch (err) {
    console.error("[Network Exception] Supabase sendMessage:", err);
  }

  return newMsg;
}

/**
 * Cross-device Cloud Synchronizer for Conversations & Messages
 * Fetches all threads the user belongs to from Supabase, merges them with local cache.
 */
export async function fetchUserConversationsFromSupabase(userId: string): Promise<StoredConversation[]> {
  if (!userId) return getConversations();

  try {
    const supabase = createClient();

    // 1. Get conversation IDs where this user is a member
    const { data: memberRows, error: memErr } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", userId);

    if (memErr || !memberRows || memberRows.length === 0) {
      return getConversations().filter((c) => c.members.some((m) => m.user_id === userId));
    }

    const convIds = Array.from(new Set(memberRows.map((r) => r.conversation_id)));

    // 2. Fetch conversations
    const { data: convRows, error: convErr } = await supabase
      .from("conversations")
      .select("*")
      .in("id", convIds);

    if (convErr || !convRows) {
      return getConversations().filter((c) => c.members.some((m) => m.user_id === userId));
    }

    // 3. Fetch all members with user details
    const { data: allMembers } = await supabase
      .from("conversation_members")
      .select("conversation_id, user_id, role, users(id, name, email)")
      .in("conversation_id", convIds);

    // 4. Fetch all messages
    const { data: allMessages } = await supabase
      .from("messages")
      .select("*")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: true });

    // 5. Merge with local storage
    const localList = getConversations();
    const localMap = new Map(localList.map((c) => [c.id, c]));

    const mergedList: StoredConversation[] = [];

    for (const cRow of convRows) {
      const localC = localMap.get(cRow.id);

      // Extract members
      const convMembers = (allMembers || [])
        .filter((m: any) => m.conversation_id === cRow.id)
        .map((m: any) => {
          const userObj = m.users;
          const uName = userObj?.name || (m.user_id === userId ? getClientDemoSession()?.name : null) || "Campus Student";
          const uEmail = userObj?.email || "";
          return {
            conversation_id: cRow.id,
            user_id: m.user_id,
            role: m.role,
            user_name: uName,
            user_email: uEmail,
            user_initials: getInitials(uName),
          };
        });

      // Extract messages
      const convMsgs: Message[] = (allMessages || [])
        .filter((msg: any) => msg.conversation_id === cRow.id)
        .map((msg: any) => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          content: msg.content,
          created_at: msg.created_at,
        }));

      // Determine titles
      let title = localC?.title;
      let subtitle = localC?.subtitle;

      if (!title) {
        if (cRow.type === "housing_group") {
          const room = cRow.room_id ? getRoomById(cRow.room_id) : null;
          title = room?.title ? `${room.title} (Roommates Group)` : "Housing (Roommates Group)";
          subtitle = room ? `${room.location_label} • ${convMembers.length} Members` : "Campus Housing";
        } else {
          const otherMember = convMembers.find((m) => m.user_id !== userId);
          title = otherMember?.user_name || "CampusLoop Chat";
          subtitle = "Direct Message";
        }
      }

      mergedList.push({
        id: cRow.id,
        listing_id: cRow.listing_id || localC?.listing_id || null,
        room_id: cRow.room_id || localC?.room_id || null,
        wanted_listing_id: localC?.wanted_listing_id || null,
        type: localC?.type || cRow.type,
        created_at: cRow.created_at,
        title,
        subtitle,
        members: convMembers.length > 0 ? convMembers : localC?.members || [],
        messages: convMsgs.length > 0 ? convMsgs : localC?.messages || [],
      });
    }

    // Keep any local-only conversations that weren't in remote (e.g. offline fallback)
    for (const localC of localList) {
      if (!convIds.includes(localC.id)) {
        mergedList.push(localC);
      }
    }

    // Save and return
    saveConversations(mergedList);
    return mergedList.filter((c) => c.members.some((m) => m.user_id === userId));
  } catch (err) {
    console.error("fetchUserConversationsFromSupabase error:", err);
    return getConversations().filter((c) => c.members.some((m) => m.user_id === userId));
  }
}

/**
 * Fetch a single conversation and its messages directly from Supabase
 */
export async function fetchConversationByIdFromSupabase(conversationId: string): Promise<StoredConversation | undefined> {
  const local = getConversationById(conversationId);
  try {
    const supabase = createClient();
    const { data: convRow } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .maybeSingle();

    if (!convRow) return local;

    const { data: members } = await supabase
      .from("conversation_members")
      .select("conversation_id, user_id, role, users(id, name, email)")
      .eq("conversation_id", conversationId);

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    const memberList = (members || []).map((m: any) => {
      const uName = m.users?.name || "Campus Student";
      return {
        conversation_id: conversationId,
        user_id: m.user_id,
        role: m.role,
        user_name: uName,
        user_email: m.users?.email || "",
        user_initials: getInitials(uName),
      };
    });

    const msgList: Message[] = (messages || []).map((m: any) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      content: m.content,
      created_at: m.created_at,
    }));

    const updated: StoredConversation = {
      id: convRow.id,
      listing_id: convRow.listing_id || local?.listing_id || null,
      room_id: convRow.room_id || local?.room_id || null,
      wanted_listing_id: local?.wanted_listing_id || null,
      type: local?.type || convRow.type,
      created_at: convRow.created_at,
      title: local?.title || "CampusLoop Chat",
      subtitle: local?.subtitle || "Active Thread",
      members: memberList.length > 0 ? memberList : local?.members || [],
      messages: msgList.length > 0 ? msgList : local?.messages || [],
    };

    const all = getConversations();
    const idx = all.findIndex((c) => c.id === conversationId);
    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.push(updated);
    }
    saveConversations([...all]);
    return updated;
  } catch (e) {
    return local;
  }
}
