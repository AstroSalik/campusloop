import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { User } from "@/lib/types";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-campusloop.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server Component context
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Server Component context
          }
        },
      },
    }
  );
}

export async function getUser(): Promise<User | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Fetch user profile from public.users table
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      return profile as User;
    }

    return {
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Student",
      email: user.email || "",
      campus_id: user.user_metadata?.campus_id || "00000000-0000-0000-0000-000000000001",
      avatar: user.user_metadata?.avatar || null,
      monthly_income: user.user_metadata?.monthly_income || null,
    };
  } catch (error) {
    return null;
  }
}

