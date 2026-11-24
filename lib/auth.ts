import { User } from "@/lib/types";

export const DEMO_CAMPUS_ID = "00000000-0000-0000-0000-000000000001";

export interface DemoUser extends User {
  initials: string;
  role_desc: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "4898495c-0953-432c-8041-9efdc1eeab5f",
    name: "Salik Riyaz",
    email: "astrosalikriyaz@gmail.com",
    campus_id: DEMO_CAMPUS_ID,
    campus_name: "Lovely Professional University (LPU)",
    city: "Phagwara, Punjab",
    department: "Computer Science & Engineering (CSE)",
    year_of_study: "4th Year (Senior / Final Year)",
    phone: "+91 98765 43210",
    avatar: "https://zbjwqilmexssmsxczkoz.supabase.co/storage/v1/object/public/avatars/4898495c-0953-432c-8041-9efdc1eeab5f-1789202648804.jpg",
    initials: "SR",
    role_desc: "Student Account",
  },
];

export const PRIMARY_DEMO_USER = DEMO_USERS[0];

export function getDemoUserById(id: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === id);
}

export function getDemoUserByEmail(email: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Client-side session helpers
 */
export function setClientDemoSession(user: DemoUser | User) {
  if (typeof window !== "undefined") {
    const demoUser: DemoUser = {
      ...user,
      initials:
        "initials" in user
          ? (user as DemoUser).initials
          : (user.name || "Student")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase(),
      role_desc:
        "role_desc" in user ? (user as DemoUser).role_desc : "Student Account",
    };
    localStorage.setItem("campusloop_user", JSON.stringify(demoUser));
    window.dispatchEvent(new Event("campusloop_auth_changed"));
  }
}

export function getClientDemoSession(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("campusloop_user");
    if (raw === "LOGGED_OUT") return null;
    if (raw) {
      const parsed = JSON.parse(raw);
      // Remove legacy identity fields left by older clients.
      const legacyFields = ["verification_status", "aadhaar_last4", "kyc_doc_type", "kyc_submitted_at", "kyc_verified_at", "aadhaar_name"];
      if (legacyFields.some((field) => field in parsed)) {
        for (const field of legacyFields) delete parsed[field];
        localStorage.setItem("campusloop_user", JSON.stringify(parsed));
      }
      const matched = getDemoUserById(parsed.id);
      return {
        ...(matched || {}),
        ...parsed,
        initials:
          parsed.initials ||
          (parsed.name
            ? parsed.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()
            : "S"),
        role_desc: parsed.role_desc || matched?.role_desc || "Student Account",
      };
    }
  } catch (e) {
    // fallback
  }
  return null;
}

export function clearClientDemoSession() {
  if (typeof window !== "undefined") {
    localStorage.setItem("campusloop_user", "LOGGED_OUT");
    document.cookie = `campusloop_demo_user_id=; path=/; max-age=0; SameSite=Lax`;
    window.dispatchEvent(new Event("campusloop_auth_changed"));
  }
}
