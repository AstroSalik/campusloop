/**
 * CampusLoop Rent Engine
 * Pure mathematical functions for rent splitting, housing ratios, and affordability assessment.
 * Strictly adheres to Project-Context.md Section 6 & PRD.md Section 4.
 * ZERO Supabase/network calls — pure, deterministic logic.
 */

import { AffordabilityFlag } from "@/lib/types";

export const AFFORDABILITY_THRESHOLDS = {
  COMFORTABLE_MAX: 30,
  MODERATE_MAX: 40,
  HIGH_MAX: 50,
} as const;

export interface RentCalculationResult {
  totalCost: number;
  perPersonShare: number;
  housingRatioPct: number;
  flag: AffordabilityFlag;
  flagLabel: string;
  flagEmoji: string;
  description: string;
}

/**
 * 1. Calculate per-person equal share
 * Total = (Rent + Utilities + Maintenance) / Occupants
 */
export function calculateSplit(
  totalRent: number,
  utilities: number = 0,
  maintenance: number = 0,
  occupants: number = 1
): number {
  if (occupants <= 0) return 0;
  const total = Number(totalRent || 0) + Number(utilities || 0) + Number(maintenance || 0);
  return Math.round(total / occupants);
}

/**
 * 2. Calculate housing burden ratio percentage
 * Ratio = (Per-Person Share / Monthly Income) * 100
 */
export function calculateHousingRatio(
  perPersonShare: number,
  monthlyIncome: number
): number {
  if (!monthlyIncome || monthlyIncome <= 0) return 0;
  const ratio = (perPersonShare / monthlyIncome) * 100;
  return Math.round(ratio * 10) / 10; // 1 decimal place precision
}

/**
 * 3. Determine affordability flag bucket
 * Thresholds:
 * - 0% to 30%: comfortable (🟢)
 * - 30.1% to 40%: moderate (🟡)
 * - 40.1% to 50%: high (🟠)
 * - > 50%: heavy (🔴)
 */
export function getAffordabilityFlag(percentage: number): AffordabilityFlag {
  if (percentage <= AFFORDABILITY_THRESHOLDS.COMFORTABLE_MAX) {
    return "comfortable";
  }
  if (percentage <= AFFORDABILITY_THRESHOLDS.MODERATE_MAX) {
    return "moderate";
  }
  if (percentage <= AFFORDABILITY_THRESHOLDS.HIGH_MAX) {
    return "high";
  }
  return "heavy";
}

/**
 * Helper: Human-readable guidance tailored to student context
 */
export function getAffordabilityDetails(flag: AffordabilityFlag): {
  label: string;
  emoji: string;
  description: string;
} {
  switch (flag) {
    case "comfortable":
      return {
        label: "Comfortable",
        emoji: "🟢",
        description:
          "Excellent budget match! Housing takes ≤30% of your income, leaving healthy savings for campus essentials.",
      };
    case "moderate":
      return {
        label: "Moderate",
        emoji: "🟡",
        description:
          "Manageable accommodation cost (30–40% of income). Maintain a standard monthly student expense buffer.",
      };
    case "high":
      return {
        label: "High Burden",
        emoji: "🟠",
        description:
          "Tight financial buffer (40–50% of income). Consider adding 1 more flatmate to reduce your per-person share.",
      };
    case "heavy":
      return {
        label: "Heavy Burden",
        emoji: "🔴",
        description:
          "High risk! Rent exceeds 50% of your monthly income/allowance. We recommend exploring lower-rent rooms or additional sharing.",
      };
  }
}

/**
 * Comprehensive evaluator combining split, ratio, and flag
 */
export function evaluateRentHealth(
  totalRent: number,
  utilities: number = 0,
  maintenance: number = 0,
  occupants: number = 1,
  monthlyIncome: number = 0
): RentCalculationResult {
  const totalCost = Number(totalRent || 0) + Number(utilities || 0) + Number(maintenance || 0);
  const perPersonShare = calculateSplit(totalRent, utilities, maintenance, occupants);
  const housingRatioPct = calculateHousingRatio(perPersonShare, monthlyIncome);
  const flag = getAffordabilityFlag(housingRatioPct);
  const { label: flagLabel, emoji: flagEmoji, description } = getAffordabilityDetails(flag);

  return {
    totalCost,
    perPersonShare,
    housingRatioPct,
    flag,
    flagLabel,
    flagEmoji,
    description,
  };
}
