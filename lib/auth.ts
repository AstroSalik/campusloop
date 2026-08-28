import { User } from "@/lib/types";

export const DEMO_CAMPUS_ID = "00000000-0000-0000-0000-000000000001";

export interface DemoUser extends User {
  initials: string;
  role_desc: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Bilal Ashiq",
    email: "bilal.demo@campusloop.app",
    campus_id: DEMO_CAMPUS_ID,
    monthly_income: 15000,
    avatar: null,
    initials: "BA",
    role_desc: "Primary Demo Account (Buyer & Room Seeker)",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Sukhmanpreet Kaur",
    email: "sukhman.demo@campusloop.app",
    campus_id: DEMO_CAMPUS_ID,
    monthly_income: 12000,
    avatar: null,
    initials: "SK",
    role_desc: "Hostel 3 (Marketplace Seller)",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Salik Riyaz",
    email: "salik.demo@campusloop.app",
    campus_id: DEMO_CAMPUS_ID,
    monthly_income: 18000,
    avatar: null,
    initials: "SR",
    role_desc: "Hostel 1 (Books & Electronics)",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Sana Wani",
    email: "sana.demo@campusloop.app",
    campus_id: DEMO_CAMPUS_ID,
    monthly_income: 10000,
    avatar: null,
    initials: "SW",
    role_desc: "Hostel 5 (Room Owner & Seller)",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Vikram Iyer",
    email: "vikram.demo@campusloop.app",
    campus_id: DEMO_CAMPUS_ID,
    monthly_income: 20000,
    avatar: null,
    initials: "VI",
    role_desc: "Main Gate Flat Owner",
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    name: "Zoya Malik",
    email: "zoya.demo@campusloop.app",
    campus_id: DEMO_CAMPUS_ID,
    monthly_income: 13000,
    avatar: null,
    initials: "ZM",
    role_desc: "Hostel 2 (Appliances & Roommate)",
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
              .join(""),
      role_desc:
        "role_desc" in user ? (user as DemoUser).role_desc : "Student Account",
    };
    localStorage.setItem("campusloop_user", JSON.stringify(demoUser));
    document.cookie = `campusloop_demo_user_id=${user.id}; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function getClientDemoSession(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("campusloop_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      const matched = getDemoUserById(parsed.id);
      if (matched) return matched;
      return {
        ...parsed,
        initials: parsed.initials || parsed.name?.[0] || "S",
        role_desc: parsed.role_desc || "Student Account",
      };
    }
  } catch (e) {
    // fallback
  }
  return PRIMARY_DEMO_USER;
}

export function clearClientDemoSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("campusloop_user");
    document.cookie = `campusloop_demo_user_id=; path=/; max-age=0; SameSite=Lax`;
  }
}
