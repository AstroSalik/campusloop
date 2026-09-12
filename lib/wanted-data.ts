import { WantedListing } from "@/lib/types";
import { DEMO_CAMPUS_ID, DEMO_USERS } from "@/lib/auth";

export interface StoredWantedListing extends WantedListing {
  requester_name: string;
  requester_email: string;
  requester_initials: string;
  location_label?: string;
}

export const INITIAL_WANTED_LISTINGS: StoredWantedListing[] = [];

const LOCAL_STORAGE_KEY = "campusloop_custom_wanted_listings";
const DELETED_STORAGE_KEY = "campusloop_deleted_wanted_listings";

export function getWantedListings(): StoredWantedListing[] {
  if (typeof window === "undefined") return [];
  try {
    const deletedRaw = localStorage.getItem(DELETED_STORAGE_KEY);
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

    const custom = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (custom) {
      const parsed: StoredWantedListing[] = JSON.parse(custom);
      return parsed.filter((w) => !deletedIds.includes(w.id));
    }
    return [];
  } catch (e) {
    // fallback
  }
  return [];
}

export function mapSupabaseWanted(row: any): StoredWantedListing {
  const requesterName = row.users?.name || "Student";
  const requesterEmail = row.users?.email || "";
  const requesterInitials =
    requesterName
      .split(" ")
      .map((w: string) => w[0])
      .filter(Boolean)
      .join("")
      .substring(0, 2)
      .toUpperCase() || "ST";

  return {
    id: row.id,
    requester_id: row.requester_id || row.seller_id,
    requester_name: requesterName,
    requester_email: requesterEmail,
    requester_initials: requesterInitials,
    campus_id: row.campus_id || DEMO_CAMPUS_ID,
    title: row.title,
    description: row.description,
    category: row.category,
    budget_max: Number(row.budget_max || row.price || 0),
    status: (row.status || "active") as any,
    location_label: row.location_label || "Campus",
    created_at: row.created_at,
  };
}

export async function fetchWantedListingsFromSupabase(): Promise<StoredWantedListing[]> {
  const results: StoredWantedListing[] = [];
  const seenIds = new Set<string>();

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    // 1. Try fetching from dedicated wanted_listings table
    try {
      const { data: wantedData, error: wantedErr } = await supabase
        .from("wanted_listings")
        .select("*, users(name, email)")
        .order("created_at", { ascending: false });

      if (!wantedErr && wantedData) {
        for (const row of wantedData) {
          if (!seenIds.has(row.id)) {
            seenIds.add(row.id);
            results.push(mapSupabaseWanted(row));
          }
        }
      }
    } catch (e) {
      // Table might not exist yet
    }

    // 2. Also fetch listings with type = 'buy' (cross-compatibility)
    try {
      const { data: buyListings, error: buyErr } = await supabase
        .from("listings")
        .select("*, users(name, email)")
        .eq("type", "buy")
        .order("created_at", { ascending: false });

      if (!buyErr && buyListings) {
        for (const row of buyListings) {
          if (!seenIds.has(row.id)) {
            seenIds.add(row.id);
            results.push(mapSupabaseWanted(row));
          }
        }
      }
    } catch (e) {}

    // Always update local cache with the exact cloud items (even if empty, to propagate deletions!)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(results));
      } catch (e) {}
    }

    return results;
  } catch (err) {
    console.warn("[Network Exception] fetchWantedListingsFromSupabase:", err);
  }

  return getWantedListings();
}

export function getWantedListingById(id: string): StoredWantedListing | undefined {
  const all = getWantedListings();
  return all.find((w) => w.id === id);
}

export async function fetchWantedListingByIdFromSupabase(id: string): Promise<StoredWantedListing | null> {
  const cached = getWantedListingById(id);
  if (cached) return cached;

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    // 1. Try wanted_listings table
    try {
      const { data, error } = await supabase
        .from("wanted_listings")
        .select("*, users(name, email)")
        .eq("id", id)
        .maybeSingle();

      if (data && !error) {
        const mapped = mapSupabaseWanted(data);
        if (typeof window !== "undefined") {
          try {
            const customRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
            const customList = customRaw ? JSON.parse(customRaw) : [];
            if (!customList.some((w: any) => w.id === id)) {
              customList.unshift(mapped);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
            }
          } catch (e) {}
        }
        return mapped;
      }
    } catch (e) {}

    // 2. Fallback to listings where type = 'buy'
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*, users(name, email)")
        .eq("id", id)
        .eq("type", "buy")
        .maybeSingle();

      if (data && !error) {
        const mapped = mapSupabaseWanted(data);
        if (typeof window !== "undefined") {
          try {
            const customRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
            const customList = customRaw ? JSON.parse(customRaw) : [];
            if (!customList.some((w: any) => w.id === id)) {
              customList.unshift(mapped);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
            }
          } catch (e) {}
        }
        return mapped;
      }
    } catch (e) {}
  } catch (err) {
    console.warn("[Network Exception] fetchWantedListingByIdFromSupabase:", err);
  }
  return null;
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

      // Attempt 1: wanted_listings table
      try {
        await supabase.from("wanted_listings").insert({
          id: newWanted.id,
          requester_id: newWanted.requester_id,
          campus_id: newWanted.campus_id,
          title: newWanted.title,
          description: newWanted.description,
          category: newWanted.category,
          budget_max: newWanted.budget_max,
          location_label: newWanted.location_label || "Campus",
          status: newWanted.status || "active",
        });
      } catch (err) {}

      // Attempt 2: listings table with type = 'buy' (ensures cross-device visibility immediately)
      try {
        await supabase.from("listings").insert({
          id: newWanted.id,
          seller_id: newWanted.requester_id,
          campus_id: newWanted.campus_id,
          title: newWanted.title,
          description: newWanted.description,
          category: newWanted.category,
          type: "buy",
          price: newWanted.budget_max,
          condition: "Wanted",
          location_label: newWanted.location_label || "Campus",
          status: "active",
        });
      } catch (err) {}
    } catch (err) {
      console.warn("Supabase wanted_listings insert warning:", err);
    }

    window.dispatchEvent(new Event("campusloop_wanted_updated"));
  }
}

export async function updateWantedListing(id: string, updatedFields: Partial<StoredWantedListing>) {
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

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const payload: any = {};
      if (updatedFields.title) payload.title = updatedFields.title;
      if (updatedFields.description) payload.description = updatedFields.description;
      if (updatedFields.category) payload.category = updatedFields.category;
      if (updatedFields.budget_max !== undefined) {
        payload.budget_max = updatedFields.budget_max;
      }
      if (updatedFields.status) payload.status = updatedFields.status;

      if (Object.keys(payload).length > 0) {
        await supabase.from("wanted_listings").update(payload).eq("id", id);
        // Also update listings table
        const listPayload: any = {};
        if (payload.title) listPayload.title = payload.title;
        if (payload.description) listPayload.description = payload.description;
        if (payload.category) listPayload.category = payload.category;
        if (payload.budget_max) listPayload.price = payload.budget_max;
        if (payload.status) listPayload.status = payload.status;
        await supabase.from("listings").update(listPayload).eq("id", id);
      }
    } catch (err) {}

    window.dispatchEvent(new Event("campusloop_wanted_updated"));
  }
}

export async function deleteWantedListing(id: string): Promise<boolean> {
  try {
    const res = await fetch("/api/wanted/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || result.error) {
      console.warn("[Server Delete] Falling back to direct client delete for wanted listing:", result.error);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("wanted_listings").delete().eq("id", id);
      await supabase.from("listings").delete().eq("id", id);
    }
  } catch (err) {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("wanted_listings").delete().eq("id", id);
      await supabase.from("listings").delete().eq("id", id);
    } catch (e) {}
  }

  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      let customList: StoredWantedListing[] = customRaw ? JSON.parse(customRaw) : [];
      customList = customList.filter((w) => w.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));

      const deletedIds = JSON.parse(localStorage.getItem(DELETED_STORAGE_KEY) || "[]");
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
      }
      localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deletedIds));
      window.dispatchEvent(new Event("campusloop_wanted_updated"));
    } catch (e) {}
  }

  return true;
}
