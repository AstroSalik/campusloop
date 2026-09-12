import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/**
 * Resolves the authenticated user ID on the server across Supabase SSR auth,
 * Authorization header Bearer token, or secure session cookie.
 */
export async function getAuthenticatedUserId(req?: NextRequest): Promise<string | null> {
  try {
    // 1. Supabase SSR session via cookies
    const serverSupabase = createServerSupabaseClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (user?.id) return user.id;

    // 2. Authorization header Bearer token
    if (req) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && serviceRoleKey) {
          const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
          });
          const { data: tokenUser } = await supabaseAdmin.auth.getUser(token);
          if (tokenUser?.user?.id) return tokenUser.user.id;
        }
      }
    }

    // 3. Fallback to active demo/client session cookie if present
    const cookieStore = cookies();
    const demoCookie = cookieStore.get("campusloop_demo_user_id");
    if (demoCookie?.value) return demoCookie.value;

    return null;
  } catch {
    return null;
  }
}
