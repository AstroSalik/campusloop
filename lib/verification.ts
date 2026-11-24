export const AADHAAR_CONSENT_VERSION = "2026-11-24";

export type VerificationStatus = "ready" | "starting" | "pending" | "verified" | "failed" | "expired";

export interface VerificationDetail {
  status: VerificationStatus;
  domain?: string;
  expiresAt?: string;
  nextStartAt?: string;
  url?: string;
}

export interface VerificationOverview {
  aadhaar: VerificationDetail & { mode: "disabled" | "sandbox" | "production" };
  identityVerified: boolean;
  campusEmail: VerificationDetail & { available: boolean };
}

export type VerificationAction =
  | { action: "start-aadhaar"; consentVersion: string }
  | { action: "check-aadhaar" }
  | { action: "send-email"; email: string }
  | { action: "confirm-email"; code: string };
