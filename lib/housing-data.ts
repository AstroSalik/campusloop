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
    owner_id: DEMO_USERS[0].id, // Salik Riyaz
    owner_name: DEMO_USERS[0].name,
    owner_email: DEMO_USERS[0].email,
    owner_initials: DEMO_USERS[0].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "2BHK Near Main Gate",
    rent: 18000,
    utilities: 1500,
    maintenance: 900,
    bedrooms: 2,
    occupancy_total: 3,
    occupancy_filled: 1,
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
        user_id: DEMO_USERS[0].id,
        user_name: DEMO_USERS[0].name,
        user_email: DEMO_USERS[0].email,
        user_initials: DEMO_USERS[0].initials,
        booked_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        spot_number: 1,
      },
    ],
    interested_users: [],
  },
  {
    id: "r02-hostel2-single",
    owner_id: DEMO_USERS[0].id, // Salik Riyaz
    owner_name: DEMO_USERS[0].name,
    owner_email: DEMO_USERS[0].email,
    owner_initials: DEMO_USERS[0].initials,
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
    interested_users: [],
  },
];

export const INITIAL_ROOMMATE_PROFILES: (RoommateProfile & { user_name: string; user_email: string; user_initials: string })[] = [
  {
    id: "prof-01",
    user_id: DEMO_USERS[0].id, // Salik Riyaz
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
    user_id: DEMO_USERS[0].id,
    user_name: "Aman Verma",
    user_email: "aman.student@campusloop.app",
    user_initials: "AV",
    budget_min: 5000,
    budget_max: 8000,
    preferred_location: "Hostel 3",
    move_in_month: "September",
    lifestyle_tags: ["Vegetarian", "Clean & Tidy", "Studious", "Non-Smoker"],
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

export type HousingRoom = typeof INITIAL_ROOMS[0];

export function mapSupabaseRoom(row: any): HousingRoom {
  const ownerName = row.users?.name || "Student";
  const ownerEmail = row.users?.email || "";
  const ownerInitials =
    ownerName
      .split(" ")
      .map((w: string) => w[0])
      .filter(Boolean)
      .join("")
      .substring(0, 2)
      .toUpperCase() || "ST";

  const initialMatch = INITIAL_ROOMS.find((r) => r.id === row.id);

  const images =
    initialMatch?.images && initialMatch.images.length > 0
      ? initialMatch.images
      : [
          {
            id: `img-${row.id}`,
            room_id: row.id,
            image_url:
              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
          },
        ];

  const rawRoom = {
    id: row.id,
    owner_id: row.owner_id,
    owner_name: ownerName,
    owner_email: ownerEmail,
    owner_initials: ownerInitials,
    campus_id: row.campus_id || DEMO_CAMPUS_ID,
    title: row.title,
    rent: Number(row.rent),
    utilities: Number(row.utilities) || 0,
    maintenance: Number(row.maintenance) || 0,
    bedrooms: Number(row.bedrooms) || 1,
    occupancy_total: Number(row.occupancy_total) || 1,
    occupancy_filled: Number(row.occupancy_filled) || 0,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    location_label: row.location_label || "Campus Area",
    available_from: row.available_from || "Immediate",
    status: (row.status || "available") as "available" | "occupied" | "archived",
    created_at: row.created_at,
    images: images,
    booked_users: initialMatch?.booked_users || [],
    interested_users: initialMatch?.interested_users || [],
  };

  return cleanRoom(rawRoom);
}

export async function fetchRoomsFromSupabase(): Promise<HousingRoom[]> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rooms")
      .select("*, users(name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Supabase] Failed to fetch cloud rooms:", error.message);
      return getRooms();
    }

    if (data) {
      const cloudRooms = data.map(mapSupabaseRoom);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(ROOMS_KEY, JSON.stringify(cloudRooms));
        } catch (e) {}
      }

      const deletedRaw = typeof window !== "undefined" ? localStorage.getItem("campusloop_deleted_rooms") : null;
      const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
      const activeInitials = INITIAL_ROOMS.filter((r) => !deletedIds.includes(r.id));

      const combined = [...cloudRooms.filter((r) => !deletedIds.includes(r.id))];
      const presentIds = new Set(combined.map((r) => r.id));

      for (const init of activeInitials) {
        if (!presentIds.has(init.id)) {
          presentIds.add(init.id);
          combined.push(cleanRoom(init));
        }
      }

      return combined;
    }
  } catch (err) {
    console.warn("[Network Exception] fetchRoomsFromSupabase:", err);
  }
  return getRooms();
}

export function getRoomById(id: string): HousingRoom | undefined {
  const all = getRooms();
  return all.find((r) => r.id === id);
}

export async function fetchRoomByIdFromSupabase(id: string): Promise<HousingRoom | null> {
  const cached = getRoomById(id);
  if (cached) return cached;

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rooms")
      .select("*, users(name, email)")
      .eq("id", id)
      .maybeSingle();

    if (data && !error) {
      const mapped = mapSupabaseRoom(data);
      if (typeof window !== "undefined") {
        try {
          const customRaw = localStorage.getItem(ROOMS_KEY);
          const customList = customRaw ? JSON.parse(customRaw) : [];
          if (!customList.some((r: any) => r.id === id)) {
            customList.unshift(mapped);
            localStorage.setItem(ROOMS_KEY, JSON.stringify(customList));
          }
        } catch (e) {}
      }
      return mapped;
    }
  } catch (err) {
    console.warn("[Network Exception] fetchRoomByIdFromSupabase:", err);
  }
  return null;
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
