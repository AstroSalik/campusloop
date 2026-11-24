import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const auth = createServerClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to start a conversation." }, { status: 401 });

    const { type, listingId, roomId, wantedId, roommateId } = await req.json().catch(() => ({}));
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ error: "Messaging is temporarily unavailable." }, { status: 503 });

    const db = createAdminClient(url, key, { auth: { persistSession: false } });
    let peerId: string | undefined;
    let peerRole = "seller";
    let userRole = "buyer";
    let listingRef: string | null = null;
    let wantedRef: string | null = null;
    let roomRef: string | null = null;

    if (type === "marketplace_dm" && typeof listingId === "string") {
      const { data } = await db.from("listings").select("seller_id, type").eq("id", listingId).maybeSingle();
      if (data && data.type !== "buy") {
        peerId = data.seller_id;
        listingRef = listingId;
      }
    } else if (type === "wanted_response" && typeof wantedId === "string") {
      const { data } = await db.from("wanted_listings").select("requester_id, status").eq("id", wantedId).maybeSingle();
      if (data?.status === "active") {
        peerId = data.requester_id;
        wantedRef = wantedId;
      } else if (!data) {
        const { data: legacy } = await db.from("listings").select("seller_id").eq("id", wantedId).eq("type", "buy").eq("status", "active").maybeSingle();
        if (legacy) {
          peerId = legacy.seller_id;
          listingRef = wantedId;
        }
      }
      peerRole = "buyer";
      userRole = "seller";
    } else if (type === "housing_group" && typeof roomId === "string") {
      const { data } = await db.from("rooms").select("owner_id, status").eq("id", roomId).maybeSingle();
      if (data && data.status !== "archived") {
        peerId = data.owner_id;
        roomRef = roomId;
      }
      peerRole = "owner";
      userRole = "prospective_roommate";
    } else if (type === "roommate_dm" && typeof roommateId === "string") {
      const { data } = await db.from("roommate_profiles").select("user_id").eq("user_id", roommateId).limit(1).maybeSingle();
      peerId = data?.user_id;
    }

    if (!peerId || peerId === user.id) {
      return NextResponse.json({ error: "This contact is no longer available." }, { status: 404 });
    }

    let existingId: string | undefined;
    if (roomRef) {
      const { data, error } = await db.from("conversations").select("id").eq("type", type).eq("room_id", roomRef).order("created_at").limit(1).maybeSingle();
      if (error) throw error;
      existingId = data?.id;
    } else {
      const { data: memberships, error } = await db.from("conversation_members").select("conversation_id, user_id").in("user_id", [user.id, peerId]);
      if (error) throw error;
      const myIds = new Set(memberships.filter((member) => member.user_id === user.id).map((member) => member.conversation_id));
      const sharedIds = memberships.filter((member) => member.user_id === peerId && myIds.has(member.conversation_id)).map((member) => member.conversation_id);
      if (sharedIds.length) {
        let query = db.from("conversations").select("id").in("id", sharedIds);
        if (wantedRef) query = query.eq("wanted_listing_id", wantedRef);
        else if (listingRef) query = query.eq("listing_id", listingRef).eq("type", type);
        else query = query.in("type", ["roommate_dm", "marketplace_dm"]).is("listing_id", null).is("room_id", null).is("wanted_listing_id", null);
        const { data, error: lookupError } = await query.order("created_at").limit(1).maybeSingle();
        if (lookupError) throw lookupError;
        existingId = data?.id;
      }
    }

    // Use the same ID when two requests start the same new thread at once.
    const identity = JSON.stringify([type, roomRef || wantedRef || listingRef, roomRef ? [] : [user.id, peerId].sort()]);
    const hash = createHash("sha256").update(identity).digest("hex");
    let conversationId = existingId || `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    if (!existingId) {
      const { error } = await db.from("conversations").upsert({
        id: conversationId,
        type,
        room_id: roomRef,
        listing_id: listingRef,
        wanted_listing_id: wantedRef,
      }, { onConflict: "id", ignoreDuplicates: true });
      if (error?.code === "23505" && roomRef) {
        const { data } = await db.from("conversations").select("id").eq("type", type).eq("room_id", roomRef).limit(1).maybeSingle();
        if (!data) throw error;
        conversationId = data.id;
      } else if (error) {
        throw error;
      }
    }

    const { error: membershipError } = await db.from("conversation_members").upsert([
      { conversation_id: conversationId, user_id: user.id, role: userRole },
      { conversation_id: conversationId, user_id: peerId, role: peerRole },
    ], { onConflict: "conversation_id,user_id", ignoreDuplicates: true });
    if (membershipError) throw membershipError;

    return NextResponse.json({ conversationId });
  } catch (error) {
    console.error("Could not create conversation:", error);
    return NextResponse.json({ error: "Could not open the conversation. Try again." }, { status: 500 });
  }
}
