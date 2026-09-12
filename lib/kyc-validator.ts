/**
 * Verhoeff Algorithm for Indian Aadhaar Number Validation
 * The official checksum algorithm specified by UIDAI for 12-digit Aadhaar cards.
 */

// Multiplication table d
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Permutation table p
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * Validates whether a 12-digit string satisfies the official Aadhaar Verhoeff checksum.
 */
export function validateAadhaarVerhoeff(aadhaar: string): boolean {
  const clean = aadhaar.replace(/\s+/g, "");
  if (!/^\d{12}$/.test(clean)) return false;

  // Disallow obvious test dummy sequences of all identical digits or simple 1-to-9
  if (/^(\d)\1{11}$/.test(clean)) return false;
  if (clean.startsWith("0") || clean.startsWith("1")) {
    // Standard UIDAI cards do not begin with 0 or 1
    // (UIDAI reserved range)
    return false;
  }

  let c = 0;
  const invertedArray = clean.split("").map(Number).reverse();

  for (let i = 0; i < invertedArray.length; i++) {
    c = d[c][p[i % 8][invertedArray[i]]];
  }

  return c === 0;
}

/**
 * Formats a 12-digit Aadhaar input into standard `XXXX XXXX XXXX` chunks.
 */
export function formatAadhaarInput(val: string): string {
  const digits = val.replace(/\D/g, "").substring(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.substring(i, i + 4));
  }
  return parts.join(" ");
}

/**
 * Validates name consistency between user profile and Aadhaar name
 */
export function checkNameSimilarity(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;
  const a = nameA.toLowerCase().trim();
  const b = nameB.toLowerCase().trim();
  if (a === b) return true;

  const tokensA = a.split(/\s+/).filter(Boolean);
  const tokensB = b.split(/\s+/).filter(Boolean);

  // Checks if at least the primary first/last name matches
  const common = tokensA.filter((tok) => tokensB.includes(tok));
  return common.length > 0;
}
