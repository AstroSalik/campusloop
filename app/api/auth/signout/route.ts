import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createClient();
    
    // Server-side signOut revokes the user's active session token on Supabase's auth server
    // and clears the auth cookie in the response headers.
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase server signOut warning:", error.message);
    }

    const response = NextResponse.json({ success: true, message: "Logged out on server" });
    
    // Ensure any residual demo or auth cookies are invalidated
    response.cookies.set("campusloop_demo_user_id", "", { path: "/", maxAge: 0 });
    
    return response;
  } catch (err: any) {
    console.error("Signout route exception:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process server sign out" },
      { status: 500 }
    );
  }
}
