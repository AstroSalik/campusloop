import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to delete your account." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const password = body.passwordConfirmation;

    if (!password) {
      return NextResponse.json(
        { error: "Your password is required to verify and authorize account deletion." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server authentication configuration missing." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Fetch user's email
    const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(userId);
    let email = authUserData?.user?.email;

    if (!email) {
      const { data: dbUser } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("id", userId)
        .maybeSingle();
      email = dbUser?.email;
    }

    if (!email) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // 2. VERIFY PASSWORD CONFIRMATION
    const supabaseAnon = createAdminClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Incorrect password. Account deletion authorization failed." },
        { status: 400 }
      );
    }

    // 3. CASCADE CLEANUP OF ALL USER DATA
    // A. Listings & images
    const { data: userListings } = await supabaseAdmin
      .from("listings")
      .select("id")
      .eq("seller_id", userId);

    if (userListings && userListings.length > 0) {
      const listingIds = userListings.map((l) => l.id);
      await supabaseAdmin.from("listing_images").delete().in("listing_id", listingIds);
      await supabaseAdmin.from("listing_restock_requests").delete().in("listing_id", listingIds);
      await supabaseAdmin.from("listings").delete().eq("seller_id", userId);
    }

    // B. Accommodations & rooms
    await supabaseAdmin.from("rooms").delete().eq("owner_id", userId);

    // C. Roommate profiles
    await supabaseAdmin.from("roommates").delete().eq("user_id", userId);

    // D. Wanted listings
    await supabaseAdmin.from("wanted_listings").delete().eq("requester_id", userId);

    // E. Blocks
    await supabaseAdmin.from("user_blocks").delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    // F. Conversations & messages
    await supabaseAdmin.from("messages").delete().eq("sender_id", userId);
    await supabaseAdmin.from("conversation_members").delete().eq("user_id", userId);

    // G. Public user profile
    await supabaseAdmin.from("users").delete().eq("id", userId);

    // H. Auth user record in Supabase
    await supabaseAdmin.auth.admin.deleteUser(userId);

    return NextResponse.json({
      success: true,
      message: "Your CampusLoop account and associated data have been permanently deleted.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error while deleting account." },
      { status: 500 }
    );
  }
}
