import { Conversation, ConversationMember, Message } from "@/lib/types";
import { DEMO_USERS, getDemoUserById, PRIMARY_DEMO_USER } from "@/lib/auth";
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

// Initial seeded conversations matching Seed-Data.md Section 6
const INITIAL_CONVERSATIONS: StoredConversation[] = [
  // Conversation A — linked to Listing #3 (Firefox Cycle, seller user_4 Sana Wani)
  {
    id: "conv-a-firefox-cycle",
    listing_id: "l03-firefox-cycle",
    room_id: null,
    type: "marketplace_dm",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    title: "Firefox Cycle (Single Speed)",
    subtitle: "Hostel 5 • ₹3,500",
    members: [
      {
        conversation_id: "conv-a-firefox-cycle",
        user_id: DEMO_USERS[3].id, // Sana Wani
        role: "seller",
        user_name: DEMO_USERS[3].name,
        user_email: DEMO_USERS[3].email,
        user_initials: DEMO_USERS[3].initials,
      },
      {
        conversation_id: "conv-a-firefox-cycle",
        user_id: DEMO_USERS[0].id, // Bilal Ashiq
        role: "buyer",
        user_name: DEMO_USERS[0].name,
        user_email: DEMO_USERS[0].email,
        user_initials: DEMO_USERS[0].initials,
      },
    ],
    messages: [
      {
        id: "msg-a-1",
        conversation_id: "conv-a-firefox-cycle",
        sender_id: DEMO_USERS[0].id,
        content: "Hi, is the cycle still available?",
        created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
      },
      {
        id: "msg-a-2",
        conversation_id: "conv-a-firefox-cycle",
        sender_id: DEMO_USERS[3].id,
        content: "Yes it is! Barely used, good condition.",
        created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
      },
      {
        id: "msg-a-3",
        conversation_id: "conv-a-firefox-cycle",
        sender_id: DEMO_USERS[0].id,
        content: "Can you do ₹3200?",
        created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      },
      {
        id: "msg-a-4",
        conversation_id: "conv-a-firefox-cycle",
        sender_id: DEMO_USERS[3].id,
        content: "₹3300 and it's yours, I can drop it at Hostel 5.",
        created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
      },
      {
        id: "msg-a-5",
        conversation_id: "conv-a-firefox-cycle",
        sender_id: DEMO_USERS[0].id,
        content: "Deal! I'll come by tomorrow evening.",
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
    ],
  },
  // Conversation B — linked to Listing #11 (Geared Cycle, seller user_1 Bilal Ashiq)
  {
    id: "conv-b-geared-cycle",
    listing_id: "l11-geared-cycle",
    room_id: null,
    type: "marketplace_dm",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    title: "Hercules Geared Cycle (21-Speed)",
    subtitle: "Main Gate PG • ₹5,500",
    members: [
      {
        conversation_id: "conv-b-geared-cycle",
        user_id: DEMO_USERS[0].id, // Bilal Ashiq
        role: "seller",
        user_name: DEMO_USERS[0].name,
        user_email: DEMO_USERS[0].email,
        user_initials: DEMO_USERS[0].initials,
      },
      {
        conversation_id: "conv-b-geared-cycle",
        user_id: DEMO_USERS[4].id, // Vikram Iyer
        role: "buyer",
        user_name: DEMO_USERS[4].name,
        user_email: DEMO_USERS[4].email,
        user_initials: DEMO_USERS[4].initials,
      },
    ],
    messages: [
      {
        id: "msg-b-1",
        conversation_id: "conv-b-geared-cycle",
        sender_id: DEMO_USERS[4].id,
        content: "Does this have front and rear brakes in good condition?",
        created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
      },
      {
        id: "msg-b-2",
        conversation_id: "conv-b-geared-cycle",
        sender_id: DEMO_USERS[0].id,
        content: "Yes, serviced last month. Gears shift smoothly too.",
        created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
      },
      {
        id: "msg-b-3",
        conversation_id: "conv-b-geared-cycle",
        sender_id: DEMO_USERS[4].id,
        content: "Great, I'm interested. Can we meet near Main Gate PG?",
        created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
      },
    ],
  },
  // Conversation C — linked to Room #1 (2BHK Near Main Gate, owner Vikram Iyer) -> Group Chat with 3 members
  {
    id: "conv-c-room1-group",
    listing_id: null,
    room_id: "r01-main-gate-2bhk",
    type: "housing_group",
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    title: "2BHK Near Main Gate (Roommates Group)",
    subtitle: "Main Gate PG • 3 Members • ₹18,000/mo",
    members: [
      {
        conversation_id: "conv-c-room1-group",
        user_id: DEMO_USERS[4].id, // Vikram Iyer (Owner)
        role: "owner",
        user_name: DEMO_USERS[4].name,
        user_email: DEMO_USERS[4].email,
        user_initials: DEMO_USERS[4].initials,
      },
      {
        conversation_id: "conv-c-room1-group",
        user_id: DEMO_USERS[0].id, // Bilal Ashiq (Prospective Roommate)
        role: "prospective_roommate",
        user_name: DEMO_USERS[0].name,
        user_email: DEMO_USERS[0].email,
        user_initials: DEMO_USERS[0].initials,
      },
      {
        conversation_id: "conv-c-room1-group",
        user_id: DEMO_USERS[2].id, // Salik Riyaz (Prospective Roommate)
        role: "prospective_roommate",
        user_name: DEMO_USERS[2].name,
        user_email: DEMO_USERS[2].email,
        user_initials: DEMO_USERS[2].initials,
      },
    ],
    messages: [
      {
        id: "msg-c-1",
        conversation_id: "conv-c-room1-group",
        sender_id: DEMO_USERS[0].id,
        content: "Hi, I'm interested in the 2BHK — is the second bedroom still open?",
        created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
      },
      {
        id: "msg-c-2",
        conversation_id: "conv-c-room1-group",
        sender_id: DEMO_USERS[4].id,
        content: "Yes! One spot left after Aman moves in next week.",
        created_at: new Date(Date.now() - 3600000 * 25).toISOString(),
      },
      {
        id: "msg-c-3",
        conversation_id: "conv-c-room1-group",
        sender_id: DEMO_USERS[2].id,
        content: "I just joined too — hi Bilal, looks like we might be flatmates!",
        created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
      },
      {
        id: "msg-c-4",
        conversation_id: "conv-c-room1-group",
        sender_id: DEMO_USERS[0].id,
        content: "Nice to meet you Salik, what's your move-in timeline?",
        created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
      },
      {
        id: "msg-c-5",
        conversation_id: "conv-c-room1-group",
        sender_id: DEMO_USERS[4].id,
        content: "I can hold the spot till Sept 1st for both of you to decide.",
        created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
      },
    ],
  },
  // Conversation D — linked to Room #6 (2BHK Near Hostel 5, owner Sana Wani) -> Group Chat with 3 members
  {
    id: "conv-d-room6-group",
    listing_id: null,
    room_id: "r06-hostel5-2bhk",
    type: "housing_group",
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    title: "2BHK Near Hostel 5 (Roommates Group)",
    subtitle: "Hostel 5 • 3 Members • ₹16,000/mo",
    members: [
      {
        conversation_id: "conv-d-room6-group",
        user_id: DEMO_USERS[3].id, // Sana Wani (Owner)
        role: "owner",
        user_name: DEMO_USERS[3].name,
        user_email: DEMO_USERS[3].email,
        user_initials: DEMO_USERS[3].initials,
      },
      {
        conversation_id: "conv-d-room6-group",
        user_id: DEMO_USERS[1].id, // Sukhmanpreet Kaur
        role: "prospective_roommate",
        user_name: DEMO_USERS[1].name,
        user_email: DEMO_USERS[1].email,
        user_initials: DEMO_USERS[1].initials,
      },
      {
        conversation_id: "conv-d-room6-group",
        user_id: DEMO_USERS[5].id, // Zoya Malik
        role: "prospective_roommate",
        user_name: DEMO_USERS[5].name,
        user_email: DEMO_USERS[5].email,
        user_initials: DEMO_USERS[5].initials,
      },
    ],
    messages: [
      {
        id: "msg-d-1",
        conversation_id: "conv-d-room6-group",
        sender_id: DEMO_USERS[1].id,
        content: "Interested in this — is it furnished?",
        created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      },
      {
        id: "msg-d-2",
        conversation_id: "conv-d-room6-group",
        sender_id: DEMO_USERS[3].id,
        content: "Yes, beds and study tables included, WiFi is active.",
        created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
      },
      {
        id: "msg-d-3",
        conversation_id: "conv-d-room6-group",
        sender_id: DEMO_USERS[5].id,
        content: "I'm interested too, budget works for me.",
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: "msg-d-4",
        conversation_id: "conv-d-room6-group",
        sender_id: DEMO_USERS[3].id,
        content: "Great, we'd just need one more person to fill it, feel free to invite anyone.",
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
    ],
  },
  // Conversation E — linked to Room #3 (3BHK Shared Flat, owner Bilal Ashiq)
  {
    id: "conv-e-room3-group",
    listing_id: null,
    room_id: "r03-shared-flat-3bhk",
    type: "housing_group",
    created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
    title: "3BHK Shared Flat (Roommates Group)",
    subtitle: "Lovely Nagar PG • 2 Members • ₹24,000/mo",
    members: [
      {
        conversation_id: "conv-e-room3-group",
        user_id: DEMO_USERS[0].id, // Bilal Ashiq (Owner)
        role: "owner",
        user_name: DEMO_USERS[0].name,
        user_email: DEMO_USERS[0].email,
        user_initials: DEMO_USERS[0].initials,
      },
      {
        conversation_id: "conv-e-room3-group",
        user_id: DEMO_USERS[3].id, // Sana Wani
        role: "prospective_roommate",
        user_name: DEMO_USERS[3].name,
        user_email: DEMO_USERS[3].email,
        user_initials: DEMO_USERS[3].initials,
      },
    ],
    messages: [
      {
        id: "msg-e-1",
        conversation_id: "conv-e-room3-group",
        sender_id: DEMO_USERS[3].id,
        content: "Hi, is the 3BHK still looking for 2 more people?",
        created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
      },
      {
        id: "msg-e-2",
        conversation_id: "conv-e-room3-group",
        sender_id: DEMO_USERS[0].id,
        content: "Yes, 2 spots open, ₹6000/person approx before utilities.",
        created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
      },
      {
        id: "msg-e-3",
        conversation_id: "conv-e-room3-group",
        sender_id: DEMO_USERS[3].id,
        content: "Sounds good, I'll check with a friend who might want the other spot.",
        created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ],
  },
];

export function getLatestTimestamp(c: StoredConversation): number {
  if (c.messages && c.messages.length > 0) {
    const lastMsg = c.messages[c.messages.length - 1];
    return new Date(lastMsg.created_at).getTime();
  }
  return new Date(c.created_at).getTime();
}

export function getConversations(): StoredConversation[] {
  let list = INITIAL_CONVERSATIONS;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        let parsed: StoredConversation[] = JSON.parse(raw);
        
        // Auto-sanitize legacy conversations that might have had "undefined"
        parsed = parsed.map((c) => {
          const cleanedTitle = c.title?.includes("undefined") || c.title === "Marketplace Listing" 
            ? (c.members.find(m => m.role === "seller")?.user_name ? `${c.members.find(m => m.role === "seller")?.user_name} (Roommate)` : "CampusLoop Chat")
            : c.title;

          const cleanedSubtitle = c.subtitle?.includes("undefined") || c.subtitle === "Campus • ₹"
            ? "Demo Campus Student"
            : c.subtitle;

          const cleanedMessages = c.messages.map((m) => {
            if (m.content.includes("undefined")) {
              return {
                ...m,
                content: m.content.replace('"undefined"', "your listing").replace(': "undefined".', "."),
              };
            }
            return m;
          });

          return {
            ...c,
            title: cleanedTitle,
            subtitle: cleanedSubtitle,
            messages: cleanedMessages,
          };
        });

        const existingIds = new Set(parsed.map((c) => c.id));
        const missingInitial = INITIAL_CONVERSATIONS.filter((c) => !existingIds.has(c.id));
        list = [...missingInitial, ...parsed];
      }
    } catch (e) {}
  }

  // Always sort by latest activity timestamp (newest message on top)
  return [...list].sort((a, b) => getLatestTimestamp(b) - getLatestTimestamp(a));
}

export function getConversationById(id: string): StoredConversation | undefined {
  const all = getConversations();
  return all.find((c) => c.id === id);
}

export function saveConversations(convs: StoredConversation[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
    } catch (e) {}
  }
}

/**
 * Flow A: Marketplace purchase interest -> Unified Chat Auto-Creation
 */
export async function getOrCreateMarketplaceConversation(
  listingId: string,
  buyerId: string,
  sellerId: string
): Promise<string> {
  const all = getConversations();

  // 1. Check if conversation already exists for this listing + buyer
  const existing = all.find(
    (c) =>
      c.type === "marketplace_dm" &&
      c.listing_id === listingId &&
      c.members.some((m) => m.user_id === buyerId)
  );

  if (existing) {
    return existing.id;
  }

  // 2. Fetch metadata
  const listing = getListingById(listingId);
  const buyer = getDemoUserById(buyerId) || PRIMARY_DEMO_USER;
  const seller = getDemoUserById(sellerId) || getDemoUserById(listing?.seller_id || "") || PRIMARY_DEMO_USER;

  const newConvId = `conv-dm-${listingId}-${buyerId}`;

  const listingTitle = listing?.title || "Marketplace Item";
  const listingSubtitle = listing 
    ? `${listing.location_label} • ₹${listing.price.toLocaleString("en-IN")}`
    : `${seller.role_desc || "Demo Campus"}`;

  const initialMsg = listing
    ? `Hi ${seller.name}, I'm interested in your listing: "${listing.title}". Is it still available?`
    : `Hi ${seller.name}, I would like to connect with you on CampusLoop!`;

  const newConv: StoredConversation = {
    id: newConvId,
    listing_id: listing ? listingId : null,
    room_id: null,
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
        user_initials: seller.initials || seller.name[0],
      },
      {
        conversation_id: newConvId,
        user_id: buyer.id,
        role: "buyer",
        user_name: buyer.name,
        user_email: buyer.email,
        user_initials: buyer.initials || buyer.name[0],
      },
    ],
    messages: [
      {
        id: `msg-${Date.now()}`,
        conversation_id: newConvId,
        sender_id: buyer.id,
        content: initialMsg,
        created_at: new Date().toISOString(),
      },
    ],
  };

  try {
    const supabase = createClient();
    const { error: convErr } = await supabase.from("conversations").insert({
      id: newConvId,
      listing_id: listing ? listingId : null,
      type: "marketplace_dm",
    });

    if (convErr) {
      if (convErr.code === "23505" || convErr.message?.includes("duplicate") || convErr.message?.includes("unique")) {
        console.warn(`[Race Condition Handled] Existing marketplace conversation for listing ${listingId}.`);
      } else {
        console.error("[Supabase Error] Marketplace conversation insert failed:", {
          operation: "getOrCreateMarketplaceConversation",
          listingId,
          buyerId,
          sellerId,
          error: convErr,
        });
      }
    }

    const { error: memErr } = await supabase.from("conversation_members").insert([
      { conversation_id: newConvId, user_id: seller.id, role: "seller" },
      { conversation_id: newConvId, user_id: buyer.id, role: "buyer" },
    ]);
    if (memErr && memErr.code !== "23505") {
      console.error("[Supabase Error] Marketplace members insert failed:", {
        conversationId: newConvId,
        error: memErr,
      });
    }

    const { error: msgErr } = await supabase.from("messages").insert({
      id: `msg-${Date.now()}`,
      conversation_id: newConvId,
      sender_id: buyer.id,
      content: initialMsg,
    });
    if (msgErr) {
      console.error("[Supabase Error] Marketplace initial message insert failed:", {
        conversationId: newConvId,
        error: msgErr,
      });
    }
  } catch (e) {
    console.error("[Network Exception] Supabase marketplace conversation creation:", {
      listingId,
      buyerId,
      exception: e,
    });
  }

  saveConversations([newConv, ...all]);
  return newConvId;
}

/**
 * Direct Roommate Connection Conversation
 */
export async function getOrCreateRoommateConversation(
  initiatorId: string,
  targetUserId: string
): Promise<string> {
  const all = getConversations();
  const initiator = getDemoUserById(initiatorId) || PRIMARY_DEMO_USER;
  const target = getDemoUserById(targetUserId) || PRIMARY_DEMO_USER;

  // Check if existing 1:1 connection already exists between these 2 users (without listing_id)
  const existing = all.find(
    (c) =>
      c.type === "marketplace_dm" &&
      !c.listing_id &&
      !c.room_id &&
      c.members.some((m) => m.user_id === initiator.id) &&
      c.members.some((m) => m.user_id === target.id)
  );

  if (existing) {
    return existing.id;
  }

  const newConvId = `conv-dm-roommate-${[initiator.id, target.id].sort().join("-")}`;

  const newConv: StoredConversation = {
    id: newConvId,
    listing_id: null,
    room_id: null,
    type: "marketplace_dm",
    created_at: new Date().toISOString(),
    title: `${target.name} (Roommate)`,
    subtitle: `${target.role_desc || "Demo Campus Student"}`,
    members: [
      {
        conversation_id: newConvId,
        user_id: target.id,
        role: "seller",
        user_name: target.name,
        user_email: target.email,
        user_initials: target.initials || target.name[0],
      },
      {
        conversation_id: newConvId,
        user_id: initiator.id,
        role: "buyer",
        user_name: initiator.name,
        user_email: initiator.email,
        user_initials: initiator.initials || initiator.name[0],
      },
    ],
    messages: [
      {
        id: `msg-${Date.now()}`,
        conversation_id: newConvId,
        sender_id: initiator.id,
        content: `Hi ${target.name}, I saw your roommate profile on CampusLoop and would love to connect about finding a place together!`,
        created_at: new Date().toISOString(),
      },
    ],
  };

  saveConversations([newConv, ...all]);
  return newConvId;
}

/**
 * Flow B: Room interest -> Auto Group Chat (Single row per room_id!)
 * PRD Section 7 (Flow B) & Project-Context.md Section 7
 */
export async function getOrCreateRoomConversation(
  roomId: string,
  userId: string,
  ownerId?: string
): Promise<string> {
  const all = getConversations();
  const room = getRoomById(roomId);
  const user = getDemoUserById(userId) || PRIMARY_DEMO_USER;
  const owner = getDemoUserById(ownerId || room?.owner_id || "") || PRIMARY_DEMO_USER;

  // 1. Check if a housing_group conversation already exists for this room_id
  const existing = all.find(
    (c) => c.type === "housing_group" && c.room_id === roomId
  );

  if (existing) {
    // Check if current user is already a member
    const isMember = existing.members.some((m) => m.user_id === user.id);
    if (!isMember) {
      // Add user as prospective_roommate member
      const newMember: ConversationMember & { user_name: string; user_email: string; user_initials: string } = {
        conversation_id: existing.id,
        user_id: user.id,
        role: "prospective_roommate",
        user_name: user.name,
        user_email: user.email,
        user_initials: user.initials || user.name[0],
      };
      existing.members.push(newMember);

      // Add auto-join inquiry message
      existing.messages.push({
        id: `msg-join-${Date.now()}`,
        conversation_id: existing.id,
        sender_id: user.id,
        content: `Hi everyone, I'm interested in this room (${room?.title || "Accommodation"}) and would like to join the roommate group!`,
        created_at: new Date().toISOString(),
      });

      existing.subtitle = `${room?.location_label || "Campus"} • ${existing.members.length} Members • ₹${room?.rent?.toLocaleString("en-IN")}/mo`;

      saveConversations([...all]);

      try {
        const supabase = createClient();
        await supabase.from("conversation_members").insert({
          conversation_id: existing.id,
          user_id: user.id,
          role: "prospective_roommate",
        });
      } catch (e) {}
    }
    return existing.id;
  }

  // 2. If no conversation exists yet for this room, create ONE with owner + student
  const newConvId = `conv-housing-${roomId}`;
  const newConv: StoredConversation = {
    id: newConvId,
    listing_id: null,
    room_id: roomId,
    type: "housing_group",
    created_at: new Date().toISOString(),
    title: `${room?.title || "Housing"} (Roommates Group)`,
    subtitle: `${room?.location_label || "Campus"} • 2 Members • ₹${room?.rent?.toLocaleString("en-IN") || ""}/mo`,
    members: [
      {
        conversation_id: newConvId,
        user_id: owner.id,
        role: "owner",
        user_name: owner.name,
        user_email: owner.email,
        user_initials: owner.initials || owner.name[0],
      },
      {
        conversation_id: newConvId,
        user_id: user.id,
        role: "prospective_roommate",
        user_name: user.name,
        user_email: user.email,
        user_initials: user.initials || user.name[0],
      },
    ],
    messages: [
      {
        id: `msg-${Date.now()}`,
        conversation_id: newConvId,
        sender_id: user.id,
        content: `Hi ${owner.name}, I'm interested in "${room?.title}". Is there still a spot open?`,
        created_at: new Date().toISOString(),
      },
    ],
  };

  try {
    const supabase = createClient();
    const { error: convErr } = await supabase.from("conversations").insert({
      id: newConvId,
      room_id: roomId,
      type: "housing_group",
    });

    if (convErr) {
      // Step 3 Race Condition Recovery: Unique violation (Postgres error 23505)
      // If another concurrent request already created the housing_group for this room_id:
      if (convErr.code === "23505" || convErr.message?.includes("duplicate") || convErr.message?.includes("unique")) {
        console.warn(`[Race Condition Handled] Concurrent housing_group insert for room ${roomId}. Re-fetching existing thread...`);
        const { data: existingRemote } = await supabase
          .from("conversations")
          .select("id, room_id, type")
          .eq("room_id", roomId)
          .eq("type", "housing_group")
          .maybeSingle();

        if (existingRemote) {
          // Add this user as member to existing remote conversation
          await supabase.from("conversation_members").insert({
            conversation_id: existingRemote.id,
            user_id: user.id,
            role: "prospective_roommate",
          });
          return existingRemote.id;
        }
      }
      console.error("[Supabase Error] Room conversation creation failed:", {
        operation: "getOrCreateRoomConversation",
        roomId,
        userId,
        error: convErr,
      });
    }

    const { error: memErr } = await supabase.from("conversation_members").insert([
      { conversation_id: newConvId, user_id: owner.id, role: "owner" },
      { conversation_id: newConvId, user_id: user.id, role: "prospective_roommate" },
    ]);
    if (memErr && memErr.code !== "23505") {
      console.error("[Supabase Error] Room member insert failed:", {
        conversationId: newConvId,
        error: memErr,
      });
    }

    const { error: msgErr } = await supabase.from("messages").insert({
      id: `msg-${Date.now()}`,
      conversation_id: newConvId,
      sender_id: user.id,
      content: `Hi ${owner.name}, I'm interested in "${room?.title}". Is there still a spot open?`,
    });
    if (msgErr) {
      console.error("[Supabase Error] Room initial message insert failed:", {
        conversationId: newConvId,
        error: msgErr,
      });
    }
  } catch (e) {
    console.error("[Network Exception] Supabase room conversation creation:", {
      roomId,
      userId,
      exception: e,
    });
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
  requesterId: string
): Promise<string> {
  const all = getConversations();

  // 1. Check if conversation already exists for this wanted listing + provider
  const existing = all.find(
    (c) =>
      c.type === "wanted_response" &&
      c.wanted_listing_id === wantedListingId &&
      c.members.some((m) => m.user_id === providerId)
  );

  if (existing) {
    return existing.id;
  }

  // 2. Fetch metadata
  const wanted = getWantedListingById(wantedListingId);
  const provider = getDemoUserById(providerId) || PRIMARY_DEMO_USER;
  const requester = getDemoUserById(requesterId) || getDemoUserById(wanted?.requester_id || "") || PRIMARY_DEMO_USER;

  const newConvId = `conv-wanted-${wantedListingId}-${provider.id}`;

  const title = wanted?.title ? `Wanted: ${wanted.title}` : "Wanted Item Response";
  const subtitle = wanted
    ? `Budget: Up to ₹${wanted.budget_max.toLocaleString("en-IN")} • ${wanted.category}`
    : `Buyer Request • Demo Campus`;

  const initialMsg = wanted
    ? `Hi ${requester.name}, I saw your request for "${wanted.title}" (Budget: up to ₹${wanted.budget_max.toLocaleString("en-IN")}). I have this available and can provide it to you!`
    : `Hi ${requester.name}, I saw your wanted request on CampusLoop and can provide this item!`;

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
        user_initials: requester.initials || requester.name[0],
      },
      {
        conversation_id: newConvId,
        user_id: provider.id,
        role: "seller",
        user_name: provider.name,
        user_email: provider.email,
        user_initials: provider.initials || provider.name[0],
      },
    ],
    messages: [
      {
        id: `msg-${Date.now()}`,
        conversation_id: newConvId,
        sender_id: provider.id,
        content: initialMsg,
        created_at: new Date().toISOString(),
      },
    ],
  };

    try {
      const supabase = createClient();
      const { error: convErr } = await supabase.from("conversations").insert({
        id: newConvId,
        wanted_listing_id: wantedListingId,
        type: "wanted_response",
      });
      if (convErr && convErr.code !== "23505") {
        console.error("[Supabase Error] Wanted conversation insert failed:", {
          operation: "getOrCreateWantedConversation",
          wantedListingId,
          providerId,
          requesterId,
          error: convErr,
        });
      }

      const { error: memErr } = await supabase.from("conversation_members").insert([
        { conversation_id: newConvId, user_id: requester.id, role: "buyer" },
        { conversation_id: newConvId, user_id: provider.id, role: "seller" },
      ]);
      if (memErr && memErr.code !== "23505") {
        console.error("[Supabase Error] Wanted conversation members insert failed:", {
          conversationId: newConvId,
          error: memErr,
        });
      }

      const { error: msgErr } = await supabase.from("messages").insert({
        id: `msg-${Date.now()}`,
        conversation_id: newConvId,
        sender_id: provider.id,
        content: initialMsg,
      });
      if (msgErr) {
        console.error("[Supabase Error] Wanted initial message insert failed:", {
          conversationId: newConvId,
          error: msgErr,
        });
      }
    } catch (e) {
      console.error("[Network Exception] Wanted conversation creation:", {
        wantedListingId,
        providerId,
        exception: e,
      });
    }

  saveConversations([newConv, ...all]);
  return newConvId;
}

/**
 * Add a new message to any conversation (Persists to both Supabase and local cache)
 */
export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
  const all = getConversations();
  const conv = all.find((c) => c.id === conversationId);

  const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = new Date().toISOString();

  const newMsg: Message = {
    id: messageId,
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    created_at: timestamp,
  };

  // 1. Update local state immediately (optimistic update)
  if (conv) {
    conv.messages.push(newMsg);
    saveConversations([...all]);
  }

  // 2. Real Supabase Database Insert
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("messages").insert({
      id: messageId,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: timestamp,
    }).select();

    if (error) {
      console.error("Supabase sendMessage error:", error);
    } else {
      console.log("Supabase message saved successfully:", data);
    }
  } catch (err) {
    console.error("Supabase sendMessage exception:", err);
  }

  return newMsg;
}

