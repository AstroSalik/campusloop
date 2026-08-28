import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { User } from "@/lib/types";
import { getDemoUserById, PRIMARY_DEMO_USER } from "@/lib/auth";

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
  const cookieStore = cookies();
  const demoUserId = cookieStore.get("campusloop_demo_user_id")?.value;

  // 1. If demo cookie is set, return corresponding demo user
  if (demoUserId) {
    const demoUser = getDemoUserById(demoUserId);
    if (demoUser) return demoUser;
  }

  // 2. Otherwise attempt Supabase Auth session check
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "Student",
        email: user.email || "",
        campus_id: user.user_metadata?.campus_id || "00000000-0000-0000-0000-000000000001",
        avatar: user.user_metadata?.avatar || null,
        monthly_income: user.user_metadata?.monthly_income || 15000,
      };
    }
  } catch (error) {
    // Supabase auth fallback
  }

  // 3. If running in dev/demo without explicit login yet, default to primary demo user (Bilal Ashiq)
  return PRIMARY_DEMO_USER;
}
