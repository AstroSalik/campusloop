import { Room, RoommateProfile, BookedUser, InterestedUser } from "@/lib/types";
import { DEMO_CAMPUS_ID, DEMO_USERS } from "@/lib/auth";

export const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const INITIAL_ROOMS: (Room & { 
  owner_name: string; 
  owner_email: string; 
  owner_initials: string;
  booked_users?: BookedUser[];
  interested_users?: InterestedUser[];
})[] = [];

export const INITIAL_ROOMMATE_PROFILES: (RoommateProfile & { user_name: string; user_email: string; user_initials: string; user_avatar?: string | null })[] = [];

const DELETED_SAMPLE_ROOMMATE_IDS = new Set(["prof-02", "prof-03", "prof-04"]);
const DELETED_SAMPLE_USER_IDS = new Set([
  "00000000-0000-0000-0000-000000000003",
  "00000000-0000-0000-0000-000000000004",
  "00000000-0000-0000-0000-000000000005",
]);

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
  if (typeof window === "undefined") return [];
  try {
    const deletedRaw = localStorage.getItem("campusloop_deleted_rooms");
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

    const custom = localStorage.getItem(ROOMS_KEY);
    if (custom) {
      const parsed: typeof INITIAL_ROOMS = JSON.parse(custom);
      return parsed.filter((r: any) => !deletedIds.includes(r.id)).map(cleanRoom);
    }
  } catch (e) {}
  return [];
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
      return cloudRooms;
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

export async function deleteRoom(id: string): Promise<boolean> {
  try {
    const res = await fetch("/api/housing/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || result.error) {
      console.warn("[Server Delete] Falling back to direct client delete for room:", result.error);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("rooms").delete().eq("id", id);
    }
  } catch (err) {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("rooms").delete().eq("id", id);
    } catch (e) {}
  }

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
  }

  return true;
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

function generateProfileUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function mapSupabaseRoommateProfile(row: any): typeof INITIAL_ROOMMATE_PROFILES[0] {
  const userName = row.users?.name || "Campus Student";
  const userEmail = row.users?.email || "";
  const userInitials =
    userName
      .split(" ")
      .map((w: string) => w[0])
      .filter(Boolean)
      .join("")
      .substring(0, 2)
      .toUpperCase() || "CS";

  return {
    id: row.id,
    user_id: row.user_id,
    user_name: userName,
    user_email: userEmail,
    user_initials: userInitials,
    user_avatar: row.users?.avatar || null,
    budget_min: Number(row.budget_min) || 5000,
    budget_max: Number(row.budget_max) || 9000,
    preferred_location: row.preferred_location || "Campus",
    move_in_month: row.move_in_month || "Any Month",
    lifestyle_tags: Array.isArray(row.lifestyle_tags) ? row.lifestyle_tags : [],
    created_at: row.created_at,
  };
}

export async function fetchRoommateProfilesFromSupabase(): Promise<typeof INITIAL_ROOMMATE_PROFILES> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("roommate_profiles")
      .select("*, users(id, name, email, avatar)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Supabase] Failed to fetch cloud roommate profiles:", error.message);
      return getRoommateProfiles();
    }

    if (data) {
      const cloudProfiles = data.map(mapSupabaseRoommateProfile);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(PROFILES_KEY, JSON.stringify(cloudProfiles));
        } catch (e) {}
      }
      return cloudProfiles;
    }
  } catch (err) {
    console.warn("[Network Exception] fetchRoommateProfilesFromSupabase:", err);
  }
  return getRoommateProfiles();
}

export function getRoommateProfiles(): typeof INITIAL_ROOMMATE_PROFILES {
  if (typeof window === "undefined") return [];
  try {
    const custom = localStorage.getItem(PROFILES_KEY);
    if (custom) {
      return JSON.parse(custom);
    }
  } catch (e) {}
  return [];
}

export async function deleteRoommateProfile(id: string): Promise<boolean> {
  try {
    const res = await fetch("/api/roommates/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || result.error) {
      console.warn("[Server Delete] Falling back to direct client delete for roommate profile:", result.error);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("roommate_profiles").delete().eq("id", id);
    }
  } catch (err) {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("roommate_profiles").delete().eq("id", id);
    } catch (e) {}
  }

  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(PROFILES_KEY);
      let customList = customRaw ? JSON.parse(customRaw) : [];
      customList = customList.filter((p: any) => p.id !== id);
      localStorage.setItem(PROFILES_KEY, JSON.stringify(customList));
      window.dispatchEvent(new Event("campusloop_roommates_updated"));
    } catch (e) {}
  }

  return true;
}

export async function saveRoommateProfile(newProfile: typeof INITIAL_ROOMMATE_PROFILES[0]) {
  if (typeof window !== "undefined") {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newProfile.id);
    const validId = isUuid ? newProfile.id : generateProfileUUID();
    const profileToSave = { ...newProfile, id: validId };

    try {
      const customRaw = localStorage.getItem(PROFILES_KEY);
      const customList = customRaw ? JSON.parse(customRaw) : [];
      const existingIdx = customList.findIndex((p: any) => p.user_id === profileToSave.user_id || p.id === profileToSave.id);
      if (existingIdx >= 0) {
        customList[existingIdx] = profileToSave;
      } else {
        customList.unshift(profileToSave);
      }
      localStorage.setItem(PROFILES_KEY, JSON.stringify(customList));
      window.dispatchEvent(new Event("campusloop_roommates_updated"));
    } catch (e) {}

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const payload = {
        id: validId,
        user_id: profileToSave.user_id,
        budget_min: Number(profileToSave.budget_min) || 5000,
        budget_max: Number(profileToSave.budget_max) || 9000,
        preferred_location: profileToSave.preferred_location,
        move_in_month: profileToSave.move_in_month,
        lifestyle_tags: profileToSave.lifestyle_tags || [],
      };

      const { error } = await supabase.from("roommate_profiles").upsert(payload, { onConflict: "id" });
      if (error) {
        console.warn("[Supabase] Roommate profile upsert notice, retrying insert:", error.message);
        await supabase.from("roommate_profiles").insert(payload);
      }
    } catch (err) {
      console.error("[Network Exception] Supabase saveRoommateProfile:", err);
    }
  }
}
