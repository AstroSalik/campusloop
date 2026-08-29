import { Room, RoommateProfile, BookedUser, InterestedUser } from "@/lib/types";
import { DEMO_CAMPUS_ID, DEMO_USERS } from "@/lib/auth";

export const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const INITIAL_ROOMS: (Room & { 
  owner_name: string; 
  owner_email: string; 
  owner_initials: string;
  booked_users?: BookedUser[];
  interested_users?: InterestedUser[];
})[] = [
  {
    id: "r01-main-gate-2bhk",
    owner_id: DEMO_USERS[4].id, // Vikram Iyer (user_5)
    owner_name: DEMO_USERS[4].name,
    owner_email: DEMO_USERS[4].email,
    owner_initials: DEMO_USERS[4].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "2BHK Near Main Gate",
    rent: 18000,
    utilities: 1500,
    maintenance: 900,
    bedrooms: 2,
    occupancy_total: 3,
    occupancy_filled: 2, // 2 spots booked, 1 spot open
    amenities: ["WiFi", "Geyser", "RO Water", "Power Backup", "Beds & Mattresses"],
    location_label: "Main Gate PG",
    available_from: "Sept 1st",
    status: "available",
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    images: [
      {
        id: "img-r01",
        room_id: "r01-main-gate-2bhk",
        image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    booked_users: [
      {
        user_id: DEMO_USERS[2].id, // Salik Riyaz
        user_name: DEMO_USERS[2].name,
        user_email: DEMO_USERS[2].email,
        user_initials: DEMO_USERS[2].initials,
        booked_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        spot_number: 1,
      },
      {
        user_id: DEMO_USERS[3].id, // Sana Wani
        user_name: DEMO_USERS[3].name,
        user_email: DEMO_USERS[3].email,
        user_initials: DEMO_USERS[3].initials,
        booked_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        spot_number: 2,
      },
    ],
    interested_users: [
      {
        user_id: DEMO_USERS[1].id, // Sukhmanpreet Kaur
        user_name: DEMO_USERS[1].name,
        user_email: DEMO_USERS[1].email,
        user_initials: DEMO_USERS[1].initials,
        interested_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        expires_at: new Date(Date.now() + 3600000 * 24 * 5).toISOString(), // 5 days left
      },
      {
        user_id: DEMO_USERS[5].id, // Zoya Malik
        user_name: DEMO_USERS[5].name,
        user_email: DEMO_USERS[5].email,
        user_initials: DEMO_USERS[5].initials,
        interested_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        expires_at: new Date(Date.now() + 3600000 * 24 * 4).toISOString(), // 4 days left
      },
    ],
  },
  {
    id: "r02-hostel2-single",
    owner_id: DEMO_USERS[5].id, // Zoya Malik (user_6)
    owner_name: DEMO_USERS[5].name,
    owner_email: DEMO_USERS[5].email,
    owner_initials: DEMO_USERS[5].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Single Room PG (Hostel 2 area)",
    rent: 8000,
    utilities: 800,
    maintenance: 400,
    bedrooms: 1,
    occupancy_total: 1,
    occupancy_filled: 0,
    amenities: ["Attached Washroom", "WiFi", "Study Table", "Geyser"],
    location_label: "Hostel 2 area",
    available_from: "Immediate",
    status: "available",
    created_at: new Date(Date.now() - 3600000 * 24 * 4.5).toISOString(),
    images: [
      {
        id: "img-r02",
        room_id: "r02-hostel2-single",
        image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    booked_users: [],
    interested_users: [
      {
        user_id: DEMO_USERS[0].id, // Bilal Ashiq
        user_name: DEMO_USERS[0].name,
        user_email: DEMO_USERS[0].email,
        user_initials: DEMO_USERS[0].initials,
        interested_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        expires_at: new Date(Date.now() + 3600000 * 24 * 6).toISOString(), // 6 days left
      },
    ],
  },
  {
    id: "r03-shared-flat-3bhk",
    owner_id: DEMO_USERS[0].id, // Bilal Ashiq (user_1)
    owner_name: DEMO_USERS[0].name,
    owner_email: DEMO_USERS[0].email,
    owner_initials: DEMO_USERS[0].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "3BHK Shared Flat",
    rent: 24000,
    utilities: 2000,
    maintenance: 1000,
    bedrooms: 3,
    occupancy_total: 4,
    occupancy_filled: 2, // 2 spots booked, 2 open
    amenities: ["Modular Kitchen", "Balcony", "Washing Machine", "WiFi", "Security Guard"],
    location_label: "Lovely Nagar PG",
    available_from: "Sept 15th",
    status: "available",
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    images: [
      {
        id: "img-r03",
        room_id: "r03-shared-flat-3bhk",
        image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    booked_users: [
      {
        user_id: DEMO_USERS[4].id, // Vikram Iyer
        user_name: DEMO_USERS[4].name,
        user_email: DEMO_USERS[4].email,
        user_initials: DEMO_USERS[4].initials,
        booked_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
        spot_number: 1,
      },
      {
        user_id: DEMO_USERS[5].id, // Zoya Malik
        user_name: DEMO_USERS[5].name,
        user_email: DEMO_USERS[5].email,
        user_initials: DEMO_USERS[5].initials,
        booked_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        spot_number: 2,
      },
    ],
    interested_users: [
      {
        user_id: DEMO_USERS[2].id, // Salik Riyaz
        user_name: DEMO_USERS[2].name,
        user_email: DEMO_USERS[2].email,
        user_initials: DEMO_USERS[2].initials,
        interested_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        expires_at: new Date(Date.now() + 3600000 * 24 * 5).toISOString(), // 5 days left
      },
      {
        user_id: DEMO_USERS[3].id, // Sana Wani
        user_name: DEMO_USERS[3].name,
        user_email: DEMO_USERS[3].email,
        user_initials: DEMO_USERS[3].initials,
        interested_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
        expires_at: new Date(Date.now() + 3600000 * 24 * 3).toISOString(), // 3 days left
      },
    ],
  },
  {
    id: "r04-twin-sharing-pg",
    owner_id: DEMO_USERS[1].id, // Sukhmanpreet Kaur (user_2)
    owner_name: DEMO_USERS[1].name,
    owner_email: DEMO_USERS[1].email,
    owner_initials: DEMO_USERS[1].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "PG Room (Twin Sharing)",
    rent: 6500,
    utilities: 600,
    maintenance: 300,
    bedrooms: 1,
    occupancy_total: 2,
    occupancy_filled: 1,
    amenities: ["Mess Included", "WiFi", "Daily Cleaning", "AC"],
    location_label: "Hostel 3",
    available_from: "Immediate",
    status: "available",
    created_at: new Date(Date.now() - 3600000 * 24 * 3.5).toISOString(),
    images: [
      {
        id: "img-r04",
        room_id: "r04-twin-sharing-pg",
        image_url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    booked_users: [
      {
        user_id: DEMO_USERS[3].id, // Sana Wani
        user_name: DEMO_USERS[3].name,
        user_email: DEMO_USERS[3].email,
        user_initials: DEMO_USERS[3].initials,
        booked_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        spot_number: 1,
      },
    ],
    interested_users: [],
  },
  {
    id: "r05-studio-1bhk",
    owner_id: DEMO_USERS[2].id, // Salik Riyaz (user_3)
    owner_name: DEMO_USERS[2].name,
    owner_email: DEMO_USERS[2].email,
    owner_initials: DEMO_USERS[2].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "1BHK Studio Apartment",
    rent: 12000,
    utilities: 1200,
    maintenance: 500,
    bedrooms: 1,
    occupancy_total: 1,
    occupancy_filled: 0,
    amenities: ["Kitchenette", "Fridge", "WiFi", "Geyser", "Balcony"],
    location_label: "Hostel 1 area",
    available_from: "Oct 1st",
    status: "available",
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    images: [
      {
        id: "img-r05",
        room_id: "r05-studio-1bhk",
        image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    booked_users: [],
    interested_users: [
      {
        user_id: DEMO_USERS[4].id, // Vikram Iyer
        user_name: DEMO_USERS[4].name,
        user_email: DEMO_USERS[4].email,
        user_initials: DEMO_USERS[4].initials,
        interested_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        expires_at: new Date(Date.now() + 3600000 * 24 * 4).toISOString(),
      },
    ],
  },
  {
    id: "r06-hostel5-2bhk",
    owner_id: DEMO_USERS[3].id, // Sana Wani (user_4)
    owner_name: DEMO_USERS[3].name,
    owner_email: DEMO_USERS[3].email,
    owner_initials: DEMO_USERS[3].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "2BHK Near Hostel 5",
    rent: 16000,
    utilities: 1400,
    maintenance: 800,
    bedrooms: 2,
    occupancy_total: 3,
    occupancy_filled: 2,
    amenities: ["WiFi", "Beds & Study Tables", "Geyser", "Inverter Backup"],
    location_label: "Hostel 5",
    available_from: "Sept 1st",
    status: "available",
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    images: [
      {
        id: "img-r06",
        room_id: "r06-hostel5-2bhk",
        image_url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    booked_users: [
      {
        user_id: DEMO_USERS[0].id, // Bilal Ashiq
        user_name: DEMO_USERS[0].name,
        user_email: DEMO_USERS[0].email,
        user_initials: DEMO_USERS[0].initials,
        booked_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        spot_number: 1,
      },
      {
        user_id: DEMO_USERS[1].id, // Sukhmanpreet Kaur
        user_name: DEMO_USERS[1].name,
        user_email: DEMO_USERS[1].email,
        user_initials: DEMO_USERS[1].initials,
        booked_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        spot_number: 2,
      },
    ],
    interested_users: [],
  },
  {
    id: "r07-triple-sharing-pg",
    owner_id: DEMO_USERS[4].id, // Vikram Iyer (user_5)
    owner_name: DEMO_USERS[4].name,
    owner_email: DEMO_USERS[4].email,
    owner_initials: DEMO_USERS[4].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "PG Triple Sharing Room",
    rent: 5500,
    utilities: 500,
    maintenance: 300,
    bedrooms: 1,
    occupancy_total: 3,
    occupancy_filled: 2,
    amenities: ["Food Included", "WiFi", "Daily Housekeeping", "CCTV"],
    location_label: "Lovely Nagar PG",
    available_from: "Immediate",
    status: "available",
    created_at: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(),
    images: [
      {
        id: "img-r07",
        room_id: "r07-triple-sharing-pg",
        image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    booked_users: [
      {
        user_id: DEMO_USERS[2].id, // Salik Riyaz
        user_name: DEMO_USERS[2].name,
        user_email: DEMO_USERS[2].email,
        user_initials: DEMO_USERS[2].initials,
        booked_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        spot_number: 1,
      },
      {
        user_id: DEMO_USERS[0].id, // Bilal Ashiq
        user_name: DEMO_USERS[0].name,
        user_email: DEMO_USERS[0].email,
        user_initials: DEMO_USERS[0].initials,
        booked_at: new Date(Date.now() - 3600000 * 24 * 0.5).toISOString(),
        spot_number: 2,
      },
    ],
    interested_users: [],
  },
  {
    id: "r08-furnished-2bhk",
    owner_id: DEMO_USERS[5].id, // Zoya Malik (user_6)
    owner_name: DEMO_USERS[5].name,
    owner_email: DEMO_USERS[5].email,
    owner_initials: DEMO_USERS[5].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "2BHK Furnished Flat",
    rent: 20000,
    utilities: 1800,
    maintenance: 900,
    bedrooms: 2,
    occupancy_total: 3,
    occupancy_filled: 1,
    amenities: ["Fully Furnished", "AC", "Washing Machine", "Modular Kitchen", "Lift"],
    location_label: "Hostel 2 area",
    available_from: "Oct 1st",
    status: "available",
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    images: [
      {
        id: "img-r08",
        room_id: "r08-furnished-2bhk",
        image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    booked_users: [
      {
        user_id: DEMO_USERS[3].id, // Sana Wani
        user_name: DEMO_USERS[3].name,
        user_email: DEMO_USERS[3].email,
        user_initials: DEMO_USERS[3].initials,
        booked_at: new Date(Date.now() - 3600000 * 24 * 0.8).toISOString(),
        spot_number: 1,
      },
    ],
    interested_users: [
      {
        user_id: DEMO_USERS[1].id, // Sukhmanpreet Kaur
        user_name: DEMO_USERS[1].name,
        user_email: DEMO_USERS[1].email,
        user_initials: DEMO_USERS[1].initials,
        interested_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        expires_at: new Date(Date.now() + 3600000 * 24 * 6).toISOString(),
      },
      {
        user_id: DEMO_USERS[4].id, // Vikram Iyer
        user_name: DEMO_USERS[4].name,
        user_email: DEMO_USERS[4].email,
        user_initials: DEMO_USERS[4].initials,
        interested_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        expires_at: new Date(Date.now() + 3600000 * 24 * 5).toISOString(),
      },
    ],
  },
];

export const INITIAL_ROOMMATE_PROFILES: (RoommateProfile & { user_name: string; user_email: string; user_initials: string })[] = [
  {
    id: "prof-01",
    user_id: DEMO_USERS[0].id, // Bilal Ashiq
    user_name: DEMO_USERS[0].name,
    user_email: DEMO_USERS[0].email,
    user_initials: DEMO_USERS[0].initials,
    budget_min: 6000,
    budget_max: 9000,
    preferred_location: "Main Gate PG",
    move_in_month: "September",
    lifestyle_tags: ["Quiet Study", "Early Bird", "Non-Smoker", "Veg/Non-Veg OK"],
  },
  {
    id: "prof-02",
    user_id: DEMO_USERS[1].id, // Sukhmanpreet Kaur
    user_name: DEMO_USERS[1].name,
    user_email: DEMO_USERS[1].email,
    user_initials: DEMO_USERS[1].initials,
    budget_min: 5000,
    budget_max: 8000,
    preferred_location: "Hostel 3",
    move_in_month: "September",
    lifestyle_tags: ["Vegetarian", "Clean & Tidy", "Studious", "Non-Smoker"],
  },
  {
    id: "prof-03",
    user_id: DEMO_USERS[2].id, // Salik Riyaz
    user_name: DEMO_USERS[2].name,
    user_email: DEMO_USERS[2].email,
    user_initials: DEMO_USERS[2].initials,
    budget_min: 7000,
    budget_max: 10000,
    preferred_location: "Hostel 1",
    move_in_month: "October",
    lifestyle_tags: ["Night Owl", "Tech Enthusiast", "Chill Vibes", "Non-Smoker"],
  },
  {
    id: "prof-04",
    user_id: DEMO_USERS[3].id, // Sana Wani
    user_name: DEMO_USERS[3].name,
    user_email: DEMO_USERS[3].email,
    user_initials: DEMO_USERS[3].initials,
    budget_min: 6000,
    budget_max: 9000,
    preferred_location: "Hostel 5",
    move_in_month: "September",
    lifestyle_tags: ["Early Bird", "Organized", "Fitness", "Non-Smoker"],
  },
  {
    id: "prof-05",
    user_id: DEMO_USERS[4].id, // Vikram Iyer
    user_name: DEMO_USERS[4].name,
    user_email: DEMO_USERS[4].email,
    user_initials: DEMO_USERS[4].initials,
    budget_min: 8000,
    budget_max: 12000,
    preferred_location: "Lovely Nagar PG",
    move_in_month: "September",
    lifestyle_tags: ["Foodie", "Music OK", "Friendly", "Non-Smoker"],
  },
  {
    id: "prof-06",
    user_id: DEMO_USERS[5].id, // Zoya Malik
    user_name: DEMO_USERS[5].name,
    user_email: DEMO_USERS[5].email,
    user_initials: DEMO_USERS[5].initials,
    budget_min: 6500,
    budget_max: 10000,
    preferred_location: "Lovely Nagar PG",
    move_in_month: "October",
    lifestyle_tags: ["Quiet Study", "Cat Friendly", "Vegetarian", "Non-Smoker"],
  },
  {
    id: "prof-07",
    user_id: DEMO_USERS[0].id, // Bilal Ashiq (alternative preference)
    user_name: DEMO_USERS[0].name,
    user_email: DEMO_USERS[0].email,
    user_initials: DEMO_USERS[0].initials,
    budget_min: 5000,
    budget_max: 7000,
    preferred_location: "Hostel 2 area",
    move_in_month: "September",
    lifestyle_tags: ["Economical", "Shared Kitchen", "Non-Smoker"],
  },
  {
    id: "prof-08",
    user_id: DEMO_USERS[2].id, // Salik Riyaz
    user_name: DEMO_USERS[2].name,
    user_email: DEMO_USERS[2].email,
    user_initials: DEMO_USERS[2].initials,
    budget_min: 7000,
    budget_max: 11000,
    preferred_location: "Main Gate PG",
    move_in_month: "September",
    lifestyle_tags: ["Coding Late", "AC Preferred", "Clean Space"],
  },
  {
    id: "prof-09",
    user_id: DEMO_USERS[4].id, // Vikram Iyer
    user_name: DEMO_USERS[4].name,
    user_email: DEMO_USERS[4].email,
    user_initials: DEMO_USERS[4].initials,
    budget_min: 6000,
    budget_max: 9000,
    preferred_location: "Hostel 5",
    move_in_month: "October",
    lifestyle_tags: ["Gym", "Friendly", "Non-Smoker"],
  },
  {
    id: "prof-10",
    user_id: DEMO_USERS[1].id, // Sukhmanpreet Kaur
    user_name: DEMO_USERS[1].name,
    user_email: DEMO_USERS[1].email,
    user_initials: DEMO_USERS[1].initials,
    budget_min: 9000,
    budget_max: 13000,
    preferred_location: "Main Gate PG",
    move_in_month: "September",
    lifestyle_tags: ["Private Room", "Balcony", "Peaceful", "Non-Smoker"],
  },
];

const ROOMS_KEY = "campusloop_custom_rooms";
const PROFILES_KEY = "campusloop_custom_profiles";

/**
 * Filter out interested students whose 7-day window has expired
 */
export function filterActiveInterests(users?: InterestedUser[]): InterestedUser[] {
  if (!users) return [];
  const now = Date.now();
  return users.filter((u) => new Date(u.expires_at).getTime() > now);
}

/**
 * Normalizes and purges expired interests for a room
 */
export function cleanRoom(room: typeof INITIAL_ROOMS[0]): typeof INITIAL_ROOMS[0] {
  const activeInterests = filterActiveInterests(room.interested_users);
  const booked = room.booked_users || [];
  return {
    ...room,
    booked_users: booked,
    interested_users: activeInterests,
    occupancy_filled: booked.length,
    status: booked.length >= room.occupancy_total ? "occupied" : "available",
  };
}

export function getRooms(): typeof INITIAL_ROOMS {
  if (typeof window === "undefined") return INITIAL_ROOMS.map(cleanRoom);
  try {
    const deletedRaw = localStorage.getItem("campusloop_deleted_rooms");
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
    const activeInitials = INITIAL_ROOMS.filter((r) => !deletedIds.includes(r.id));

    const custom = localStorage.getItem(ROOMS_KEY);
    if (custom) {
      const parsed: typeof INITIAL_ROOMS = JSON.parse(custom);
      const combined = [...parsed.filter((r: any) => !deletedIds.includes(r.id)), ...activeInitials];
      // Deduplicate by ID
      const map = new Map<string, typeof INITIAL_ROOMS[0]>();
      for (const item of combined) {
        if (!map.has(item.id)) {
          map.set(item.id, cleanRoom(item));
        }
      }
      return Array.from(map.values());
    }
    return activeInitials.map(cleanRoom);
  } catch (e) {}
  return INITIAL_ROOMS.map(cleanRoom);
}

export function getRoomById(id: string) {
  const all = getRooms();
  return all.find((r) => r.id === id);
}

export async function saveRoom(newRoom: typeof INITIAL_ROOMS[0]) {
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(ROOMS_KEY);
      const customList = customRaw ? JSON.parse(customRaw) : [];
      customList.unshift(cleanRoom(newRoom));
      localStorage.setItem(ROOMS_KEY, JSON.stringify(customList));
      window.dispatchEvent(new Event("campusloop_housing_updated"));
    } catch (e) {}

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("rooms").insert({
        id: newRoom.id,
        owner_id: newRoom.owner_id,
        campus_id: newRoom.campus_id,
        title: newRoom.title,
        rent: newRoom.rent,
        utilities: newRoom.utilities || 0,
        maintenance: newRoom.maintenance || 0,
        bedrooms: newRoom.bedrooms || 1,
        occupancy_total: newRoom.occupancy_total || 1,
        occupancy_filled: newRoom.occupancy_filled || 0,
        amenities: newRoom.amenities || [],
        location_label: newRoom.location_label,
        available_from: newRoom.available_from,
        status: newRoom.status || "available",
      });
      if (error && error.code !== "23505") {
        console.error("[Supabase Error] Room insert failed:", error);
      }
    } catch (err) {
      console.error("[Network Exception] Supabase room save:", err);
    }
  }
}

export async function updateRoom(id: string, updatedFields: Partial<typeof INITIAL_ROOMS[0]>) {
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(ROOMS_KEY);
      let customList: typeof INITIAL_ROOMS = customRaw ? JSON.parse(customRaw) : [];
      const customIndex = customList.findIndex((r) => r.id === id);

      if (customIndex >= 0) {
        customList[customIndex] = cleanRoom({ ...customList[customIndex], ...updatedFields });
        localStorage.setItem(ROOMS_KEY, JSON.stringify(customList));
      } else {
        const initial = INITIAL_ROOMS.find((r) => r.id === id);
        if (initial) {
          const updated = cleanRoom({ ...initial, ...updatedFields });
          customList.unshift(updated);
          localStorage.setItem(ROOMS_KEY, JSON.stringify(customList));
        }
      }
      window.dispatchEvent(new Event("campusloop_housing_updated"));
    } catch (e) {}

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const payload: any = {};
      if (updatedFields.title) payload.title = updatedFields.title;
      if (updatedFields.rent !== undefined) payload.rent = updatedFields.rent;
      if (updatedFields.utilities !== undefined) payload.utilities = updatedFields.utilities;
      if (updatedFields.maintenance !== undefined) payload.maintenance = updatedFields.maintenance;
      if (updatedFields.bedrooms !== undefined) payload.bedrooms = updatedFields.bedrooms;
      if (updatedFields.occupancy_total !== undefined) payload.occupancy_total = updatedFields.occupancy_total;
      if (updatedFields.occupancy_filled !== undefined) payload.occupancy_filled = updatedFields.occupancy_filled;
      if (updatedFields.amenities) payload.amenities = updatedFields.amenities;
      if (updatedFields.location_label) payload.location_label = updatedFields.location_label;
      if (updatedFields.available_from) payload.available_from = updatedFields.available_from;
      if (updatedFields.status) payload.status = updatedFields.status;

      if (Object.keys(payload).length > 0) {
        const { error } = await supabase.from("rooms").update(payload).eq("id", id);
        if (error) console.error("[Supabase Error] Room update failed:", error);
      }
    } catch (err) {
      console.error("[Network Exception] Supabase room update:", err);
    }
  }
}

export async function deleteRoom(id: string) {
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(ROOMS_KEY);
      let customList: typeof INITIAL_ROOMS = customRaw ? JSON.parse(customRaw) : [];
      customList = customList.filter((r) => r.id !== id);
      localStorage.setItem(ROOMS_KEY, JSON.stringify(customList));

      const deletedIds = JSON.parse(localStorage.getItem("campusloop_deleted_rooms") || "[]");
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
      }
      localStorage.setItem("campusloop_deleted_rooms", JSON.stringify(deletedIds));
      window.dispatchEvent(new Event("campusloop_housing_updated"));
    } catch (e) {}

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) console.error("[Supabase Error] Room delete failed:", error);
    } catch (err) {
      console.error("[Network Exception] Supabase room delete:", err);
    }
  }
}

/**
 * Marks a student as interested in a room with a 7-day expiration time limit
 */
export function markUserInterested(
  roomId: string,
  user: { id: string; name: string; email: string; initials: string }
): { success: boolean; message: string; room?: typeof INITIAL_ROOMS[0] } {
  const room = getRoomById(roomId);
  if (!room) return { success: false, message: "Room not found." };

  // Check if already booked
  const isBooked = (room.booked_users || []).some((b) => b.user_id === user.id);
  if (isBooked) {
    return { success: false, message: "You have already booked a spot in this room!" };
  }

  // Active interests list
  let activeInterests = filterActiveInterests(room.interested_users);
  const existingIdx = activeInterests.findIndex((i) => i.user_id === user.id);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ONE_WEEK_MS);

  const interestRecord: InterestedUser = {
    user_id: user.id,
    user_name: user.name,
    user_email: user.email,
    user_initials: user.initials,
    interested_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  if (existingIdx >= 0) {
    activeInterests[existingIdx] = interestRecord; // Refresh 7-day window
  } else {
    activeInterests.push(interestRecord);
  }

  updateRoom(roomId, { interested_users: activeInterests });
  return { 
    success: true, 
    message: "You've marked your interest! You have a 7-day window to finalize your booking.",
    room: getRoomById(roomId),
  };
}

/**
 * Withdraws a student's interest from a room
 */
export function withdrawUserInterest(roomId: string, userId: string) {
  const room = getRoomById(roomId);
  if (!room) return;

  const updatedInterests = (room.interested_users || []).filter((i) => i.user_id !== userId);
  updateRoom(roomId, { interested_users: updatedInterests });
}

/**
 * Officially books a spot in a room.
 * Moves student from "Interested" -> "Booked", decrements available spots, updates itinerary.
 */
export function bookRoomSpot(
  roomId: string,
  user: { id: string; name: string; email: string; initials: string }
): { success: boolean; message: string; room?: typeof INITIAL_ROOMS[0] } {
  const room = getRoomById(roomId);
  if (!room) return { success: false, message: "Accommodation not found." };

  const booked = room.booked_users || [];
  if (booked.some((b) => b.user_id === user.id)) {
    return { success: false, message: "You have already booked a spot in this accommodation!" };
  }

  if (booked.length >= room.occupancy_total) {
    return { success: false, message: "Sorry, all spots in this accommodation are fully booked!" };
  }

  // Remove from interested list if present
  const updatedInterests = (room.interested_users || []).filter((i) => i.user_id !== user.id);

  // Assign spot
  const newSpotNumber = booked.length + 1;
  const newBooking: BookedUser = {
    user_id: user.id,
    user_name: user.name,
    user_email: user.email,
    user_initials: user.initials,
    booked_at: new Date().toISOString(),
    spot_number: newSpotNumber,
  };

  const updatedBooked = [...booked, newBooking];
  const newOccupancyFilled = updatedBooked.length;
  const newStatus = newOccupancyFilled >= room.occupancy_total ? "occupied" : "available";

  updateRoom(roomId, {
    booked_users: updatedBooked,
    interested_users: updatedInterests,
    occupancy_filled: newOccupancyFilled,
    status: newStatus,
  });

  return {
    success: true,
    message: `Congratulations! You have officially booked Spot #${newSpotNumber}!`,
    room: getRoomById(roomId),
  };
}

/**
 * Cancels a student's booked spot
 */
export function cancelRoomBooking(
  roomId: string,
  userId: string
): { success: boolean; message: string } {
  const room = getRoomById(roomId);
  if (!room) return { success: false, message: "Room not found." };

  const booked = room.booked_users || [];
  const updatedBooked = booked
    .filter((b) => b.user_id !== userId)
    .map((b, idx) => ({ ...b, spot_number: idx + 1 }));

  updateRoom(roomId, {
    booked_users: updatedBooked,
    occupancy_filled: updatedBooked.length,
    status: "available",
  });

  return { success: true, message: "Your booking has been cancelled and spot opened." };
}

/**
 * Get all active interests for a user with calculated countdown details
 */
export function getUserActiveInterests(userId: string): {
  room: typeof INITIAL_ROOMS[0];
  interest: InterestedUser;
  daysLeft: number;
  hoursLeft: number;
  isExpiringSoon: boolean; // < 2 days
}[] {
  const allRooms = getRooms();
  const results = [];

  for (const r of allRooms) {
    const activeInterests = filterActiveInterests(r.interested_users);
    const userInterest = activeInterests.find((i) => i.user_id === userId);
    if (userInterest) {
      const msLeft = Math.max(0, new Date(userInterest.expires_at).getTime() - Date.now());
      const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      results.push({
        room: r,
        interest: userInterest,
        daysLeft,
        hoursLeft,
        isExpiringSoon: daysLeft <= 2,
      });
    }
  }

  return results;
}

/**
 * Get all active bookings for a user
 */
export function getUserActiveBookings(userId: string): {
  room: typeof INITIAL_ROOMS[0];
  booking: BookedUser;
}[] {
  const allRooms = getRooms();
  const results = [];

  for (const r of allRooms) {
    const userBooking = (r.booked_users || []).find((b) => b.user_id === userId);
    if (userBooking) {
      results.push({
        room: r,
        booking: userBooking,
      });
    }
  }

  return results;
}

export function getRoommateProfiles(): typeof INITIAL_ROOMMATE_PROFILES {
  if (typeof window === "undefined") return INITIAL_ROOMMATE_PROFILES;
  try {
    const custom = localStorage.getItem(PROFILES_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      return [...parsed, ...INITIAL_ROOMMATE_PROFILES];
    }
  } catch (e) {}
  return INITIAL_ROOMMATE_PROFILES;
}

export function saveRoommateProfile(newProfile: typeof INITIAL_ROOMMATE_PROFILES[0]) {
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(PROFILES_KEY);
      const customList = customRaw ? JSON.parse(customRaw) : [];
      customList.unshift(newProfile);
      localStorage.setItem(PROFILES_KEY, JSON.stringify(customList));
    } catch (e) {}
  }
}
