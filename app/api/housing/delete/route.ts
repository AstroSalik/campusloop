import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Sign in to delete this accommodation." }, { status: 401 });
    }

    const { id } = await request.json().catch(() => ({}));
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: "Deletion is temporarily unavailable." }, { status: 503 });
    }

    const db = createClient(url, key, { auth: { persistSession: false } });
    const { data: record, error: lookupError } = await db.from("rooms")
      .select("owner_id").eq("id", id).maybeSingle();
    if (lookupError) throw lookupError;
    if (record && record.owner_id !== userId) {
      return NextResponse.json({ error: "You can only delete your own accommodation." }, { status: 403 });
    }

    if (record) {
      const { error } = await db.from("rooms").delete().eq("id", id).eq("owner_id", userId);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Delete accommodation failed:", error);
    return NextResponse.json({ error: "Could not delete this accommodation. Please try again." }, { status: 500 });
  }
}
