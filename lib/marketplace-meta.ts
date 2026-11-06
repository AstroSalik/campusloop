/**
 * CampusLoop Marketplace Metadata & Schema Adapter
 * Safely persists and restores dynamic listing attributes (quantity, sold_out_at, restock_requests_count)
 * across both modern schema-extended PostgreSQL tables and base schema configurations.
 */

export interface ListingMetadata {
  quantity: number;
  sold_out_at: string | null;
  restock_requests_count: number;
}

const META_PREFIX = "<!--CL_META:";
const META_SUFFIX = "-->";

/**
 * Extracts metadata from listing fields and description fallback tag.
 */
export function extractListingMetadata(row: {
  quantity?: number | null;
  sold_out_at?: string | null;
  restock_requests_count?: number | null;
  status?: string | null;
  description?: string | null;
  created_at?: string | null;
}): { meta: ListingMetadata; cleanDescription: string } {
  let quantity = typeof row.quantity === "number" ? row.quantity : null;
  let sold_out_at = row.sold_out_at || null;
  let restock_requests_count = typeof row.restock_requests_count === "number" ? row.restock_requests_count : null;
  let cleanDescription = row.description || "";

  // Check if description contains embedded metadata tag
  if (cleanDescription.includes(META_PREFIX)) {
    try {
      const startIndex = cleanDescription.indexOf(META_PREFIX);
      const endIndex = cleanDescription.indexOf(META_SUFFIX, startIndex);
      if (endIndex > startIndex) {
        const jsonStr = cleanDescription.substring(startIndex + META_PREFIX.length, endIndex);
        const parsed = JSON.parse(jsonStr);

        if (quantity === null && typeof parsed.qty === "number") {
          quantity = parsed.qty;
        }
        if (sold_out_at === null && parsed.sold_at) {
          sold_out_at = parsed.sold_at;
        }
        if (restock_requests_count === null && typeof parsed.reqs === "number") {
          restock_requests_count = parsed.reqs;
        }

        // Clean description for user display
        cleanDescription = (cleanDescription.substring(0, startIndex) + cleanDescription.substring(endIndex + META_SUFFIX.length)).trim();
      }
    } catch {
      // ignore parse errors
    }
  }

  // Fallback defaults if not found
  if (quantity === null) {
    quantity = row.status === "sold" ? 0 : 1;
  }
  if (sold_out_at === null && row.status === "sold") {
    sold_out_at = row.created_at || new Date().toISOString();
  }
  if (restock_requests_count === null) {
    restock_requests_count = 0;
  }

  return {
    meta: {
      quantity: Math.max(0, quantity),
      sold_out_at,
      restock_requests_count,
    },
    cleanDescription,
  };
}

/**
 * Injects metadata into description string for zero-loss cloud persistence.
 */
export function injectListingMetadata(
  description: string,
  meta: Partial<ListingMetadata>
): string {
  // Strip any existing metadata tag first
  let raw = description || "";
  if (raw.includes(META_PREFIX)) {
    const startIndex = raw.indexOf(META_PREFIX);
    const endIndex = raw.indexOf(META_SUFFIX, startIndex);
    if (endIndex > startIndex) {
      raw = (raw.substring(0, startIndex) + raw.substring(endIndex + META_SUFFIX.length)).trim();
    }
  }

  const payload = {
    qty: typeof meta.quantity === "number" ? meta.quantity : 1,
    sold_at: meta.sold_out_at || null,
    reqs: meta.restock_requests_count || 0,
  };

  return `${raw}\n\n${META_PREFIX}${JSON.stringify(payload)}${META_SUFFIX}`.trim();
}

