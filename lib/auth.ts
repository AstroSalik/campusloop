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
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    initials: "SR",
    role_desc: "Student Account (Primary)",
    verification_status: "verified",
    aadhaar_last4: "4892",
    kyc_doc_type: "Aadhaar Card",
    kyc_verified_at: "2026-08-15T10:00:00.000Z",
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
      verification_status: user.verification_status || "unverified",
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
    document.cookie = `campusloop_demo_user_id=${user.id}; path=/; max-age=86400; SameSite=Lax`;
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
      const matched = getDemoUserById(parsed.id);
      return {
        ...(matched || {}),
        ...parsed,
        verification_status: parsed.verification_status || matched?.verification_status || "unverified",
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
