import { WantedListing } from "@/lib/types";
import { DEMO_CAMPUS_ID, DEMO_USERS } from "@/lib/auth";

export interface StoredWantedListing extends WantedListing {
  requester_name: string;
  requester_email: string;
  requester_initials: string;
  location_label?: string;
}

export const INITIAL_WANTED_LISTINGS: StoredWantedListing[] = [
  {
    id: "w01-mini-fridge",
    requester_id: DEMO_USERS[0].id, // Salik Riyaz
    requester_name: DEMO_USERS[0].name,
    requester_email: DEMO_USERS[0].email,
    requester_initials: DEMO_USERS[0].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Looking for a mini fridge under ₹2500",
    description: "Need a compact working mini-fridge for my room in Main Gate PG. Must cool properly, cosmetic scratches or minor dents are totally fine. Can pick up this weekend.",
    category: "Appliances",
    budget_max: 2500,
    status: "active",
    location_label: "Main Gate PG",
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: "w03-casio-calc",
    requester_id: DEMO_USERS[0].id, // Salik Riyaz
    requester_name: DEMO_USERS[0].name,
    requester_email: DEMO_USERS[0].email,
    requester_initials: DEMO_USERS[0].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Looking for Casio fx-991EX or fx-991CW Calculator",
    description: "Urgent requirement for upcoming semester exams. Need a genuine Casio scientific calculator with all matrix and complex functions working smoothly.",
    category: "Electronics",
    budget_max: 750,
    status: "active",
    location_label: "Hostel 1",
    created_at: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(),
  },
];

const LOCAL_STORAGE_KEY = "campusloop_custom_wanted_listings";
const DELETED_STORAGE_KEY = "campusloop_deleted_wanted_listings";

export function getWantedListings(): StoredWantedListing[] {
  if (typeof window === "undefined") return INITIAL_WANTED_LISTINGS;
  try {
    const deletedRaw = localStorage.getItem(DELETED_STORAGE_KEY);
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
    const activeInitials = INITIAL_WANTED_LISTINGS.filter((w) => !deletedIds.includes(w.id));

    const custom = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (custom) {
      const parsed: StoredWantedListing[] = JSON.parse(custom);
      return [...parsed.filter((w) => !deletedIds.includes(w.id)), ...activeInitials];
    }
    return activeInitials;
  } catch (e) {
    // fallback
  }
  return INITIAL_WANTED_LISTINGS;
}

export function getWantedListingById(id: string): StoredWantedListing | undefined {
  const all = getWantedListings();
  return all.find((w) => w.id === id);
}

export async function saveWantedListing(newWanted: StoredWantedListing) {
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const customList: StoredWantedListing[] = customRaw ? JSON.parse(customRaw) : [];
      customList.unshift(newWanted);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
    } catch (e) {
      // fallback
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("wanted_listings").insert({
        id: newWanted.id,
        requester_id: newWanted.requester_id,
        campus_id: newWanted.campus_id,
        title: newWanted.title,
        description: newWanted.description,
        category: newWanted.category,
        budget_max: newWanted.budget_max,
        status: newWanted.status || "active",
      });
    } catch (err) {
      console.warn("Supabase wanted_listings insert warning:", err);
    }
  }
}

export function updateWantedListing(id: string, updatedFields: Partial<StoredWantedListing>) {
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      let customList: StoredWantedListing[] = customRaw ? JSON.parse(customRaw) : [];
      const customIndex = customList.findIndex((w) => w.id === id);

      if (customIndex >= 0) {
        customList[customIndex] = { ...customList[customIndex], ...updatedFields };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
      } else {
        const initial = INITIAL_WANTED_LISTINGS.find((w) => w.id === id);
        if (initial) {
          const updated = { ...initial, ...updatedFields };
          customList.unshift(updated);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
        }
      }
    } catch (e) {
      // fallback
    }
  }
}

export function deleteWantedListing(id: string) {
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      let customList: StoredWantedListing[] = customRaw ? JSON.parse(customRaw) : [];
      customList = customList.filter((w) => w.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));

      // Also track deleted initial IDs
      const deletedIds = JSON.parse(localStorage.getItem(DELETED_STORAGE_KEY) || "[]");
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
      }
      localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deletedIds));
    } catch (e) {}
  }
}
