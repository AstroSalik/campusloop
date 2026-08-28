import { Listing } from "@/lib/types";
import { DEMO_CAMPUS_ID, DEMO_USERS } from "@/lib/auth";

export const INITIAL_LISTINGS: (Listing & { seller_name: string; seller_email: string; seller_initials: string })[] = [
  {
    id: "l01-study-table",
    seller_id: DEMO_USERS[1].id, // Sukhmanpreet Kaur (user_2)
    seller_name: DEMO_USERS[1].name,
    seller_email: DEMO_USERS[1].email,
    seller_initials: DEMO_USERS[1].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Study Table with Drawer",
    description: "Solid engineered wood study desk with 2 smooth-glide drawers. Great for laptop and books, no wobbling.",
    category: "Furniture",
    type: "sell",
    price: 1200,
    condition: "Good",
    location_label: "Hostel 3",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
  },
  {
    id: "l02-bajaj-lamp",
    seller_id: DEMO_USERS[2].id, // Salik Riyaz (user_3)
    seller_name: DEMO_USERS[2].name,
    seller_email: DEMO_USERS[2].email,
    seller_initials: DEMO_USERS[2].initials,
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
  },
  {
    id: "l03-firefox-cycle",
    seller_id: DEMO_USERS[3].id, // Sana Wani (user_4)
    seller_name: DEMO_USERS[3].name,
    seller_email: DEMO_USERS[3].email,
    seller_initials: DEMO_USERS[3].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Firefox Cycle (Single Speed)",
    description: "Well maintained single speed commuter cycle. Front basket, mudguards, and wire lock included.",
    category: "Cycles",
    type: "sell",
    price: 3500,
    condition: "Good",
    location_label: "Hostel 5",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: "l04-mini-fridge",
    seller_id: DEMO_USERS[4].id, // Vikram Iyer (user_5)
    seller_name: DEMO_USERS[4].name,
    seller_email: DEMO_USERS[4].email,
    seller_initials: DEMO_USERS[4].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Mini Fridge 45L",
    description: "Compact 45-litre refrigerator with mini freezer section. Cools super fast, energy efficient.",
    category: "Appliances",
    type: "sell",
    price: 3000,
    condition: "Fair",
    location_label: "Lovely Nagar PG",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 2.8).toISOString(),
  },
  {
    id: "l05-scientific-calc",
    seller_id: DEMO_USERS[5].id, // Zoya Malik (user_6)
    seller_name: DEMO_USERS[5].name,
    seller_email: DEMO_USERS[5].email,
    seller_initials: DEMO_USERS[5].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Casio fx-991EX Scientific Calculator",
    description: "Original Casio ClassWiz fx-991EX with textbook display. Allowed for all engineering exams.",
    category: "Electronics",
    type: "sell",
    price: 900,
    condition: "Like New",
    location_label: "Hostel 2",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 2.5).toISOString(),
  },
  {
    id: "l06-single-mattress",
    seller_id: DEMO_USERS[1].id, // Sukhmanpreet Kaur
    seller_name: DEMO_USERS[1].name,
    seller_email: DEMO_USERS[1].email,
    seller_initials: DEMO_USERS[1].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Single Bed Foam Mattress",
    description: "4-inch high density foam mattress, standard hostel bed size (3x6 ft). Clean with protective cover.",
    category: "Furniture",
    type: "sell",
    price: 800,
    condition: "Good",
    location_label: "Hostel 3",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 2.2).toISOString(),
  },
  {
    id: "l07-mechanics-book",
    seller_id: DEMO_USERS[2].id, // Salik Riyaz
    seller_name: DEMO_USERS[2].name,
    seller_email: DEMO_USERS[2].email,
    seller_initials: DEMO_USERS[2].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Engineering Mechanics Textbook",
    description: "Standard syllabus textbook with solved problems and practice questions. No missing pages.",
    category: "Books",
    type: "sell",
    price: 350,
    condition: "Good",
    location_label: "Hostel 1",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 2.0).toISOString(),
  },
  {
    id: "l08-jbl-speaker",
    seller_id: DEMO_USERS[3].id, // Sana Wani
    seller_name: DEMO_USERS[3].name,
    seller_email: DEMO_USERS[3].email,
    seller_initials: DEMO_USERS[3].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "JBL Go Bluetooth Speaker",
    description: "Compact wireless speaker, 5 hours battery backup, waterproof design. Great sound for room.",
    category: "Electronics",
    type: "sell",
    price: 1100,
    condition: "Good",
    location_label: "Hostel 5",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 1.8).toISOString(),
  },
  {
    id: "l09-steel-cupboard",
    seller_id: DEMO_USERS[4].id, // Vikram Iyer
    seller_name: DEMO_USERS[4].name,
    seller_email: DEMO_USERS[4].email,
    seller_initials: DEMO_USERS[4].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Steel Cupboard (2-Door)",
    description: "Monthly rental for spacious 2-door steel wardrobe with mirror and key locks.",
    category: "Furniture",
    type: "rent",
    price: 500,
    condition: "Good",
    location_label: "Lovely Nagar PG",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(),
  },
  {
    id: "l10-induction-cooktop",
    seller_id: DEMO_USERS[5].id, // Zoya Malik
    seller_name: DEMO_USERS[5].name,
    seller_email: DEMO_USERS[5].email,
    seller_initials: DEMO_USERS[5].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Prestige Induction Cooktop 1600W",
    description: "Push button induction stove with timer and preset Indian menus. Works perfectly with steel vessels.",
    category: "Appliances",
    type: "sell",
    price: 1300,
    condition: "Like New",
    location_label: "Hostel 2",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 1.3).toISOString(),
  },
  {
    id: "l11-geared-cycle",
    seller_id: DEMO_USERS[0].id, // Bilal Ashiq (user_1)
    seller_name: DEMO_USERS[0].name,
    seller_email: DEMO_USERS[0].email,
    seller_initials: DEMO_USERS[0].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Hercules Geared Cycle (21-Speed)",
    description: "Shimano 21-speed gears, front suspension, disc brakes. Freshly serviced with new brake pads.",
    category: "Cycles",
    type: "sell",
    price: 5500,
    condition: "Good",
    location_label: "Main Gate PG",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 1.0).toISOString(),
  },
  {
    id: "l12-iron-box",
    seller_id: DEMO_USERS[1].id, // Sukhmanpreet Kaur
    seller_name: DEMO_USERS[1].name,
    seller_email: DEMO_USERS[1].email,
    seller_initials: DEMO_USERS[1].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Philips Dry Iron Box",
    description: "Lightweight 1000W dry iron with non-stick soleplate and temperature control dial.",
    category: "Appliances",
    type: "sell",
    price: 500,
    condition: "Fair",
    location_label: "Hostel 3",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 0.9).toISOString(),
  },
  {
    id: "l13-cormen-algo",
    seller_id: DEMO_USERS[2].id, // Salik Riyaz
    seller_name: DEMO_USERS[2].name,
    seller_email: DEMO_USERS[2].email,
    seller_initials: DEMO_USERS[2].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Introduction to Algorithms (CLRS 3rd Edition)",
    description: "The classic MIT algorithms bible. Clean binding, highlighted key chapters for DSA course.",
    category: "Books",
    type: "sell",
    price: 600,
    condition: "Good",
    location_label: "Hostel 1",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 0.8).toISOString(),
  },
  {
    id: "l14-desk-chair",
    seller_id: DEMO_USERS[3].id, // Sana Wani
    seller_name: DEMO_USERS[3].name,
    seller_email: DEMO_USERS[3].email,
    seller_initials: DEMO_USERS[3].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Ergonomic Mesh Desk Chair",
    description: "Monthly rental for breathable mesh back office chair with adjustable height and lumbar support.",
    category: "Furniture",
    type: "rent",
    price: 400,
    condition: "Good",
    location_label: "Hostel 5",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 0.7).toISOString(),
  },
  {
    id: "l15-electric-kettle",
    seller_id: DEMO_USERS[4].id, // Vikram Iyer
    seller_name: DEMO_USERS[4].name,
    seller_email: DEMO_USERS[4].email,
    seller_initials: DEMO_USERS[4].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Pigeon 1.5L Electric Kettle",
    description: "Stainless steel electric boiling kettle with auto cut-off. Essential for late night noodles and tea.",
    category: "Appliances",
    type: "sell",
    price: 600,
    condition: "Like New",
    location_label: "Lovely Nagar PG",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 0.6).toISOString(),
  },
  {
    id: "l16-wall-clock",
    seller_id: DEMO_USERS[5].id, // Zoya Malik
    seller_name: DEMO_USERS[5].name,
    seller_email: DEMO_USERS[5].email,
    seller_initials: DEMO_USERS[5].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Silent Sweep Room Wall Clock",
    description: "Ajanta 10-inch silent quartz clock. Zero ticking sound, great for study focus.",
    category: "Other",
    type: "sell",
    price: 200,
    condition: "Good",
    location_label: "Hostel 2",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 0.5).toISOString(),
  },
  {
    id: "l17-badminton-set",
    seller_id: DEMO_USERS[0].id, // Bilal Ashiq
    seller_name: DEMO_USERS[0].name,
    seller_email: DEMO_USERS[0].email,
    seller_initials: DEMO_USERS[0].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Yonex Badminton Racket Set (2 Rackets + 3 Shuttles)",
    description: "Graphite shaft pair with padded carrying case and tube of Mavis 350 nylon shuttles.",
    category: "Other",
    type: "sell",
    price: 700,
    condition: "Good",
    location_label: "Main Gate PG",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 0.4).toISOString(),
  },
  {
    id: "l18-table-fan",
    seller_id: DEMO_USERS[1].id, // Sukhmanpreet Kaur
    seller_name: DEMO_USERS[1].name,
    seller_email: DEMO_USERS[1].email,
    seller_initials: DEMO_USERS[1].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "High-Speed Desk Table Fan",
    description: "Monthly rental for oscillating 3-speed table fan. Low noise, powerful airflow.",
    category: "Appliances",
    type: "rent",
    price: 300,
    condition: "Fair",
    location_label: "Hostel 3",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 0.3).toISOString(),
  },
  {
    id: "l19-laptop-stand",
    seller_id: DEMO_USERS[2].id, // Salik Riyaz
    seller_name: DEMO_USERS[2].name,
    seller_email: DEMO_USERS[2].email,
    seller_initials: DEMO_USERS[2].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Aluminium Foldable Laptop Stand",
    description: "6-angle height adjustable aluminium riser. Sturdy, fits 11-16 inch laptops with silicone pads.",
    category: "Electronics",
    type: "sell",
    price: 650,
    condition: "Like New",
    location_label: "Hostel 1",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 0.2).toISOString(),
  },
  {
    id: "l20-curtains",
    seller_id: DEMO_USERS[3].id, // Sana Wani
    seller_name: DEMO_USERS[3].name,
    seller_email: DEMO_USERS[3].email,
    seller_initials: DEMO_USERS[3].initials,
    campus_id: DEMO_CAMPUS_ID,
    title: "Room Curtains (Set of 2, 7ft)",
    description: "Navy blue blackout eyelet curtains for standard hostel window/door.",
    category: "Other",
    type: "sell",
    price: 400,
    condition: "Good",
    location_label: "Hostel 5",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24 * 0.1).toISOString(),
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

export function getListingById(id: string) {
  const all = getListings();
  return all.find((l) => l.id === id);
}

export function saveListing(newListing: typeof INITIAL_LISTINGS[0]) {
  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const customList = customRaw ? JSON.parse(customRaw) : [];
      customList.unshift(newListing);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customList));
    } catch (e) {
      // fallback
    }
  }
}

export function updateListing(id: string, updatedFields: Partial<typeof INITIAL_LISTINGS[0]>) {
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
  }
}

export function deleteListing(id: string) {
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
  }
}


