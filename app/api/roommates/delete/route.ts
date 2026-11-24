import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Sign in to delete this roommate profile." }, { status: 401 });
    }

    const { id } = await request.json().catch(() => ({}));
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "Roommate Profile ID is required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: "Deletion is temporarily unavailable." }, { status: 503 });
    }

    const db = createClient(url, key, { auth: { persistSession: false } });
    const { data: record, error: lookupError } = await db.from("roommate_profiles")
      .select("user_id").eq("id", id).maybeSingle();
    if (lookupError) throw lookupError;
    if (record && record.user_id !== userId) {
      return NextResponse.json({ error: "You can only delete your own roommate profile." }, { status: 403 });
    }

    if (record) {
      const { error } = await db.from("roommate_profiles").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Delete roommate profile failed:", error);
    return NextResponse.json({ error: "Could not delete this roommate profile. Please try again." }, { status: 500 });
  }
}
