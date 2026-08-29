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
    requester_id: DEMO_USERS[0].id, // Bilal Ashiq (user_1)
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
    id: "w02-study-table",
    requester_id: DEMO_USERS[1].id, // Sukhmanpreet Kaur (user_2)
    requester_name: DEMO_USERS[1].name,
    requester_email: DEMO_USERS[1].email,
    requester_initials: DEMO_USERS[1].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Need a study table, budget ₹1000",
    description: "Looking for a sturdy wooden or metal study desk for Hostel 3. Prefer something with a small drawer or shelf for books and laptop.",
    category: "Furniture",
    budget_max: 1000,
    status: "active",
    location_label: "Hostel 3",
    created_at: new Date(Date.now() - 3600000 * 24 * 1.8).toISOString(),
  },
  {
    id: "w03-casio-calc",
    requester_id: DEMO_USERS[2].id, // Salik Riyaz (user_3)
    requester_name: DEMO_USERS[2].name,
    requester_email: DEMO_USERS[2].email,
    requester_initials: DEMO_USERS[2].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Looking for Casio fx-991EX or fx-991CW Calculator",
    description: "Urgent requirement for upcoming semester exams. Need a genuine Casio scientific calculator with all matrix and complex functions working smoothly.",
    category: "Electronics",
    budget_max: 750,
    status: "active",
    location_label: "Hostel 1",
    created_at: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(),
  },
  {
    id: "w04-mattress",
    requester_id: DEMO_USERS[3].id, // Sana Wani (user_4)
    requester_name: DEMO_USERS[3].name,
    requester_email: DEMO_USERS[3].email,
    requester_initials: DEMO_USERS[3].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Need Single Bed Mattress for Hostel 5",
    description: "Looking for a clean 4-inch single bed foam mattress (standard hostel size 3x6 ft). Budget around ₹700, can pick up immediately from any hostel on campus.",
    category: "Furniture",
    budget_max: 700,
    status: "active",
    location_label: "Hostel 5",
    created_at: new Date(Date.now() - 3600000 * 24 * 1.2).toISOString(),
  },
  {
    id: "w05-electric-kettle",
    requester_id: DEMO_USERS[4].id, // Vikram Iyer (user_5)
    requester_name: DEMO_USERS[4].name,
    requester_email: DEMO_USERS[4].email,
    requester_initials: DEMO_USERS[4].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Looking for an Electric Kettle under ₹500",
    description: "Need a working 1.5L or 1.8L stainless steel electric boiling kettle for tea and late night instant noodles. Should have auto shut-off.",
    category: "Appliances",
    budget_max: 500,
    status: "active",
    location_label: "Lovely Nagar PG",
    created_at: new Date(Date.now() - 3600000 * 24 * 1.0).toISOString(),
  },
  {
    id: "w06-geared-cycle",
    requester_id: DEMO_USERS[5].id, // Zoya Malik (user_6)
    requester_name: DEMO_USERS[5].name,
    requester_email: DEMO_USERS[5].email,
    requester_initials: DEMO_USERS[5].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Need 21-Speed Geared Bicycle (any brand)",
    description: "Seeking a reliable geared commuter cycle for daily transit between PG and campus. Brakes and gear shifters must be in working order. Open to Hercules, Firefox, or Montra.",
    category: "Cycles",
    budget_max: 4000,
    status: "active",
    location_label: "Hostel 2",
    created_at: new Date(Date.now() - 3600000 * 24 * 0.6).toISOString(),
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
