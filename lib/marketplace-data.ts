import { Listing } from "@/lib/types";
import { DEMO_CAMPUS_ID, DEMO_USERS } from "@/lib/auth";

export const INITIAL_LISTINGS: (Listing & { seller_name: string; seller_email: string; seller_initials: string })[] = [
  {
    id: "l01-study-table",
    seller_id: DEMO_USERS[0].id, // Salik Riyaz
    seller_name: DEMO_USERS[0].name,
    seller_email: DEMO_USERS[0].email,
    seller_initials: DEMO_USERS[0].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Study Table with Drawer",
    description: "Solid engineered wood study desk with 2 smooth-glide drawers. Great for laptop and books, no wobbling.",
    category: "Furniture",
    type: "sell",
    price: 1200,
    condition: "Good",
    location_label: "Hostel 1",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    images: [
      {
        id: "img-l01",
        listing_id: "l01-study-table",
        image_url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "l02-bajaj-lamp",
    seller_id: DEMO_USERS[0].id, // Salik Riyaz
    seller_name: DEMO_USERS[0].name,
    seller_email: DEMO_USERS[0].email,
    seller_initials: DEMO_USERS[0].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Bajaj LED Study Lamp",
    description: "3-level touch dimmable warm/white LED light. Flexible neck, USB rechargeable battery.",
    category: "Furniture",
    type: "sell",
    price: 450,
    condition: "Like New",
    location_label: "Hostel 1",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 3.5).toISOString(),
    images: [
      {
        id: "img-l02",
        listing_id: "l02-bajaj-lamp",
        image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "l03-firefox-cycle",
    seller_id: DEMO_USERS[0].id, // Salik Riyaz
    seller_name: DEMO_USERS[0].name,
    seller_email: DEMO_USERS[0].email,
    seller_initials: DEMO_USERS[0].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Firefox Cycle (Single Speed)",
    description: "Well maintained single speed commuter cycle. Front basket, mudguards, and wire lock included.",
    category: "Cycles",
    type: "sell",
    price: 3500,
    condition: "Good",
    location_label: "Hostel 1",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    images: [
      {
        id: "img-l03",
        listing_id: "l03-firefox-cycle",
        image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "l05-scientific-calc",
    seller_id: DEMO_USERS[0].id, // Salik Riyaz
    seller_name: DEMO_USERS[0].name,
    seller_email: DEMO_USERS[0].email,
    seller_initials: DEMO_USERS[0].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Casio fx-991EX Scientific Calculator",
    description: "Original Casio ClassWiz fx-991EX with textbook display. Allowed for all engineering exams.",
    category: "Electronics",
    type: "sell",
    price: 900,
    condition: "Like New",
    location_label: "Hostel 1",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 2.5).toISOString(),
    images: [
      {
        id: "img-l05",
        listing_id: "l05-scientific-calc",
        image_url: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "l06-electric-kettle",
    seller_id: "00000000-0000-0000-0000-000000000003",
    seller_name: "Aman Verma",
    seller_email: "aman.student@campusloop.app",
    seller_initials: "AV",
    campus_id: DEMO_CAMPUS_ID,
    title: "Pigeon 1.5L Electric Kettle",
    description: "Stainless steel electric kettle for tea, coffee, and instant noodles. Auto cut-off protection.",
    category: "Electronics",
    type: "sell",
    price: 550,
    condition: "Good",
    location_label: "Hostel 3",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    images: [
      {
        id: "img-l06",
        listing_id: "l06-electric-kettle",
        image_url: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "l07-clrs-algorithms",
    seller_id: "00000000-0000-0000-0000-000000000004",
    seller_name: "Priya Nair",
    seller_email: "priya.student@campusloop.app",
    seller_initials: "PN",
    campus_id: DEMO_CAMPUS_ID,
    title: "Introduction to Algorithms (CLRS 3rd Ed)",
    description: "Essential computer science handbook for DSA exams and placements. Clean pages, no torn sheets.",
    category: "Books",
    type: "sell",
    price: 650,
    condition: "Like New",
    location_label: "Hostel 1",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(),
    images: [
      {
        id: "img-l07",
        listing_id: "l07-clrs-algorithms",
        image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "l08-ergonomic-chair",
    seller_id: "00000000-0000-0000-0000-000000000005",
    seller_name: "Vikram Iyer",
    seller_email: "vikram.student@campusloop.app",
    seller_initials: "VI",
    campus_id: DEMO_CAMPUS_ID,
    title: "Ergonomic Mesh Study Chair",
    description: "Breathable back support with height adjustment and smooth caster wheels. Perfect for late study sessions.",
    category: "Furniture",
    type: "sell",
    price: 1800,
    condition: "Good",
    location_label: "Lovely Nagar PG",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    images: [
      {
        id: "img-l08",
        listing_id: "l08-ergonomic-chair",
        image_url: "https://images.unsplash.com/photo-1580481077194-469b27521e1a?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

const LOCAL_STORAGE_KEY = "campusloop_custom_listings";

export function getListings(): typeof INITIAL_LISTINGS {
  if (typeof window === "undefined") return INITIAL_LISTINGS;
  try {
    const deletedRaw = localStorage.getItem("campusloop_deleted_listings");
    const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
    const activeInitials = INITIAL_LISTINGS.filter((l) => !deletedIds.includes(l.id));

    const custom = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      return [...parsed.filter((l: any) => !deletedIds.includes(l.id)), ...activeInitials];
    }
    return activeInitials;
  } catch (e) {
    // fallback
  }
  return INITIAL_LISTINGS;
}

export type MarketplaceListing = typeof INITIAL_LISTINGS[0];

export function getDefaultListingImage(title: string = "", category: string = ""): string {
  const t = (title || "").toLowerCase();
  const c = (category || "").toLowerCase();

  if (t.includes("macbook") || t.includes("apple laptop") || t.includes("laptop") || t.includes("notebook") || t.includes("mac")) {
    return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"; // MacBook Pro
  }
  if (t.includes("lamp") || t.includes("light") || t.includes("led") || t.includes("bajaj")) {
    return "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"; // LED Desk Study Lamp
  }
  if (t.includes("kettle") || t.includes("pigeon") || t.includes("water heater") || t.includes("tea maker")) {
    return "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80"; // Electric Kettle
  }
  if (t.includes("calc") || t.includes("casio") || t.includes("scientific") || t.includes("fx-")) {
    return "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80"; // Casio scientific calculator
  }
  if (t.includes("cycle") || t.includes("bike") || t.includes("firefox") || t.includes("hero") || c.includes("cycle")) {
    return "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80"; // Bicycle
  }
  if (t.includes("chair") || t.includes("seat") || t.includes("stool")) {
    return "https://images.unsplash.com/photo-1580481077194-469b27521e1a?auto=format&fit=crop&w=800&q=80"; // Desk Chair
  }
  if (t.includes("table") || t.includes("desk") || c.includes("furniture")) {
    return "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80"; // Study Table
  }
  if (t.includes("fridge") || t.includes("refrigerator") || t.includes("cooler")) {
    return "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80"; // Mini Fridge
  }
  if (t.includes("speaker") || t.includes("audio") || t.includes("sound") || t.includes("headphone") || t.includes("earphone")) {
    return "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80"; // Bluetooth Speaker
  }
  if (c.includes("book") || t.includes("book") || t.includes("notes") || t.includes("clrs") || t.includes("algorithms") || t.includes("engineering")) {
    return "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"; // CS Textbook
  }
  if (c.includes("electronic")) {
    return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80";
  }

  return "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80";
}

export function mapSupabaseListing(row: any): MarketplaceListing {
  const sellerName = row.users?.name || "Student";
  const sellerEmail = row.users?.email || "";
  const sellerInitials =
    sellerName
      .split(" ")
      .map((w: string) => w[0])
      .filter(Boolean)
      .join("")
      .substring(0, 2)
      .toUpperCase() || "ST";

  const normalizeImageUrl = (url: string, title: string = "", category: string = "") => {
    if (!url) return getDefaultListingImage(title, category);
    if (url.includes("photo-1534353436294-0dbd4bdac845")) {
      return "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80";
    }
    if (url.includes("photo-1611162617213-7d7a39e9b1d7")) {
      return "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80";
    }
    if (url.includes("photo-1594213114663-d94db9b17125")) {
      return "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80";
    }
    if (url.includes("photo-1526738549149-8e07eca6c147")) {
      return getDefaultListingImage(title, category);
    }
    return url;
  };

  const images =
    Array.isArray(row.listing_images) && row.listing_images.length > 0
      ? row.listing_images.map((img: any) => ({
          id: img.id || `img-${row.id}`,
          listing_id: row.id,
          image_url: normalizeImageUrl(img.image_url, row.title, row.category),
        }))
      : [
          {
            id: `img-${row.id}`,
            listing_id: row.id,
            image_url: getDefaultListingImage(row.title, row.category),
          },
        ];

  return {
    id: row.id,
    seller_id: row.seller_id,
    seller_name: sellerName,
    seller_email: sellerEmail,
    seller_initials: sellerInitials,
    campus_id: row.campus_id || DEMO_CAMPUS_ID,
    title: row.title,
    description: row.description,
    category: row.category,
    type: row.type || "sell",
    price: Number(row.price),
    condition: row.condition || "Good",
    location_label: row.location_label || "Campus",
    status: row.status || "active",
    created_at: row.created_at,
    images: images,
  };
}

export async function fetchListingsFromSupabase(): Promise<MarketplaceListing[]> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("*, listing_images(*), users(name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Supabase] Failed to fetch cloud listings:", error.message);
      return getListings();
    }

    if (data) {
      const cloudListings = data.map(mapSupabaseListing);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudListings));
        } catch (e) {}
      }

      const deletedRaw = typeof window !== "undefined" ? localStorage.getItem("campusloop_deleted_listings") : null;
      const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
      const activeInitials = INITIAL_LISTINGS.filter((l) => !deletedIds.includes(l.id));

      const combined = [...cloudListings.filter((l) => !deletedIds.includes(l.id))];
      const presentIds = new Set(combined.map((l) => l.id));

      for (const init of activeInitials) {
        if (!presentIds.has(init.id)) {
          presentIds.add(init.id);
          combined.push(init);
        }
      }

      return combined;
    }
  } catch (err) {
    console.warn("[Network Exception] fetchListingsFromSupabase:", err);
  }
  return getListings();
}

export function getListingById(id: string): MarketplaceListing | undefined {
  const all = getListings();
  return all.find((l) => l.id === id);
}

export async function fetchListingByIdFromSupabase(id: string): Promise<MarketplaceListing | null> {
  const cached = getListingById(id);
  if (cached) return cached;

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("*, listing_images(*), users(name, email)")
      .eq("id", id)
      .maybeSingle();

    if (data && !error) {
      const mapped = mapSupabaseListing(data);
      if (typeof window !== "undefined") {
        try {
          const customRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
          const customList = customRaw ? JSON.parse(customRaw) : [];
          if (!customList.some((l: any) => l.id === id)) {
            customList.unshift(mapped);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
          }
        } catch (e) {}
      }
      return mapped;
    }
  } catch (err) {
    console.warn("[Network Exception] fetchListingByIdFromSupabase:", err);
  }
  return null;
}

export async function saveListing(newListing: typeof INITIAL_LISTINGS[0]) {
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const customList = customRaw ? JSON.parse(customRaw) : [];
      customList.unshift(newListing);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
    } catch (e) {
      // fallback
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: listErr } = await supabase.from("listings").insert({
        id: newListing.id,
        seller_id: newListing.seller_id,
        campus_id: newListing.campus_id,
        title: newListing.title,
        description: newListing.description,
        category: newListing.category,
        type: newListing.type,
        price: newListing.price,
        condition: newListing.condition,
        location_label: newListing.location_label,
        status: newListing.status || "active",
      });
      if (listErr && listErr.code !== "23505") {
        console.error("[Supabase Error] Listing insert failed:", listErr);
      }

      if (newListing.images && newListing.images.length > 0) {
        const imageRows = newListing.images.map((img) => ({
          id: img.id,
          listing_id: newListing.id,
          image_url: img.image_url,
        }));
        const { error: imgErr } = await supabase.from("listing_images").insert(imageRows);
        if (imgErr && imgErr.code !== "23505") {
          console.error("[Supabase Error] Listing images insert failed:", imgErr);
        }
      }
    } catch (err) {
      console.error("[Network Exception] Supabase listing save:", err);
    }

    window.dispatchEvent(new Event("campusloop_marketplace_updated"));
  }
}

export async function updateListing(id: string, updatedFields: Partial<typeof INITIAL_LISTINGS[0]>) {
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      let customList: typeof INITIAL_LISTINGS = customRaw ? JSON.parse(customRaw) : [];
      const customIndex = customList.findIndex((l) => l.id === id);

      if (customIndex >= 0) {
        customList[customIndex] = { ...customList[customIndex], ...updatedFields };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
      } else {
        const initial = INITIAL_LISTINGS.find((l) => l.id === id);
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
      if (updatedFields.type) payload.type = updatedFields.type;
      if (updatedFields.price !== undefined) payload.price = updatedFields.price;
      if (updatedFields.condition) payload.condition = updatedFields.condition;
      if (updatedFields.location_label) payload.location_label = updatedFields.location_label;
      if (updatedFields.status) payload.status = updatedFields.status;

      if (Object.keys(payload).length > 0) {
        const { error } = await supabase.from("listings").update(payload).eq("id", id);
        if (error) console.error("[Supabase Error] Listing update failed:", error);
      }
    } catch (err) {
      console.error("[Network Exception] Supabase listing update:", err);
    }

    window.dispatchEvent(new Event("campusloop_marketplace_updated"));
  }
}

export async function deleteListing(id: string) {
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      let customList: typeof INITIAL_LISTINGS = customRaw ? JSON.parse(customRaw) : [];
      customList = customList.filter((l) => l.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));

      // Also track deleted initial IDs
      const deletedIds = JSON.parse(localStorage.getItem("campusloop_deleted_listings") || "[]");
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
      }
      localStorage.setItem("campusloop_deleted_listings", JSON.stringify(deletedIds));
    } catch (e) {}

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) console.error("[Supabase Error] Listing delete failed:", error);
    } catch (err) {
      console.error("[Network Exception] Supabase listing delete:", err);
    }

    window.dispatchEvent(new Event("campusloop_marketplace_updated"));
  }
}


