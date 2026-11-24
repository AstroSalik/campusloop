import type { NextRequest } from "next/server";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Resolves the account from a session or access token validated by Supabase.
 */
export async function getAuthenticatedUserId(req?: NextRequest): Promise<string | null> {
  try {
    const { data: { user }, error } = await createServerSupabaseClient().auth.getUser();
    if (!error && user?.id) return user.id;

    const token = req?.headers.get("authorization")?.match(/^Bearer (\S+)$/i)?.[1];
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!token || !url || !key) return null;

    const client = createClient(url, key, { auth: { persistSession: false } });
    const { data, error: tokenError } = await client.auth.getUser(token);
    return tokenError ? null : data.user?.id ?? null;
  } catch {
    return null;
  }
}
