import { SupabaseClient } from "@supabase/supabase-js";
import { extractListingMetadata } from "./marketplace-meta";

export const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Automatically purges listings that have been sold out for >= 3 days (72 hours)
 * permanently from Supabase PostgreSQL (including images & relations).
 */
export async function purgeExpiredSoldListings(
  supabaseAdmin: SupabaseClient
): Promise<{ purgedCount: number; purgedIds: string[] }> {
  try {
    // 1. Fetch sold listings
    const { data: soldListings, error } = await supabaseAdmin
      .from("listings")
      .select("id, status, created_at, description")
      .eq("status", "sold");

    if (error || !soldListings || soldListings.length === 0) {
      return { purgedCount: 0, purgedIds: [] };
    }

    const now = Date.now();
    const idsToPurge: string[] = [];

    for (const listing of soldListings) {
      const { meta } = extractListingMetadata(listing);
      const soldTimestamp = meta.sold_out_at
        ? new Date(meta.sold_out_at).getTime()
        : (listing.created_at ? new Date(listing.created_at).getTime() : 0);

      if (soldTimestamp && now - soldTimestamp >= THREE_DAYS_MS) {
        idsToPurge.push(listing.id);
      }
    }

    if (idsToPurge.length === 0) {
      return { purgedCount: 0, purgedIds: [] };
    }

    console.log(`[Marketplace Auto-Purge] Purging ${idsToPurge.length} listings sold out >= 3 days:`, idsToPurge);

    for (const id of idsToPurge) {
      try {
        // Unlink conversations
        await supabaseAdmin
          .from("conversations")
          .update({ listing_id: null })
          .eq("listing_id", id);

        // Delete images
        await supabaseAdmin
          .from("listing_images")
          .delete()
          .eq("listing_id", id);

        // Delete restock requests if table exists
        try {
          await supabaseAdmin
            .from("listing_restock_requests")
            .delete()
            .eq("listing_id", id);
        } catch {}

        // Delete listing
        await supabaseAdmin
          .from("listings")
          .delete()
          .eq("id", id);
      } catch (delErr) {
        console.warn(`[Auto-Purge] Failed to delete listing ${id}:`, delErr);
      }
    }

    return { purgedCount: idsToPurge.length, purgedIds: idsToPurge };
  } catch (err) {
    console.warn("[Marketplace Auto-Purge] Exception during cleanup:", err);
    return { purgedCount: 0, purgedIds: [] };
  }
}

