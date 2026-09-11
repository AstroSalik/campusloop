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
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    initials: "SR",
    role_desc: "Student Account (Primary)",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Aman Verma",
    email: "aman.student@campusloop.app",
    campus_id: DEMO_CAMPUS_ID,
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
    initials: "AV",
    role_desc: "Student Account",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Priya Nair",
    email: "priya.student@campusloop.app",
    campus_id: DEMO_CAMPUS_ID,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    initials: "PN",
    role_desc: "Student Account",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Vikram Iyer",
    email: "vikram.student@campusloop.app",
    campus_id: DEMO_CAMPUS_ID,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    initials: "VI",
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
          : user.name
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
