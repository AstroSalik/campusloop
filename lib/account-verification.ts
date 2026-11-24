import "server-only";
import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AADHAAR_CONSENT_VERSION, type VerificationDetail, type VerificationOverview } from "@/lib/verification";

type Method = "aadhaar" | "aadhaar_sandbox" | "campus_email";
type Attempt = {
  user_id: string;
  method: Method;
  attempt_id: string;
  status: "starting" | "pending" | "verified" | "failed";
  created_at: string;
  expires_at: string;
  verified_at: string | null;
  last_checked_at: string | null;
  provider_request_id: string | null;
  consent_version: string | null;
  campus_domain: string | null;
  code_digest: string | null;
  failed_attempts: number;
};

const TABLE = "account_verifications";
const COOLDOWN = 60_000;
const MAX_CODE_ATTEMPTS = 5;
const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export class VerificationError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
  }
}

function aadhaarConfig() {
  const mode = process.env.SETU_AADHAAR_MODE;
  if (mode !== "sandbox" && mode !== "production") return null;
  if (mode === "sandbox" && process.env.VERCEL_ENV === "production") return null;
  if (mode === "production" && process.env.SETU_AADHAAR_PRODUCTION_APPROVED !== "true") return null;
  const {
    SETU_CLIENT_ID, SETU_CLIENT_SECRET, SETU_PRODUCT_INSTANCE_ID, VERIFICATION_APP_ORIGIN,
  } = process.env;
  if (!SETU_CLIENT_ID || !SETU_CLIENT_SECRET || !SETU_PRODUCT_INSTANCE_ID || !VERIFICATION_APP_ORIGIN) return null;
  let returnOrigin: URL;
  try {
    returnOrigin = new URL(VERIFICATION_APP_ORIGIN);
  } catch {
    return null;
  }
  if (returnOrigin.protocol !== "https:" || returnOrigin.origin !== VERIFICATION_APP_ORIGIN) return null;
  return {
    mode,
    method: mode === "production" ? "aadhaar" : "aadhaar_sandbox",
    origin: mode === "production" ? "https://dg.setu.co" : "https://dg-sandbox.setu.co",
    callback: new URL("/api/kyc/return", returnOrigin).href,
    headers: {
      "x-client-id": SETU_CLIENT_ID,
      "x-client-secret": SETU_CLIENT_SECRET,
      "x-product-instance-id": SETU_PRODUCT_INSTANCE_ID,
    },
  } as const;
}

function emailConfig() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const secret = process.env.CAMPUS_VERIFICATION_SECRET;
  const domains = (process.env.CAMPUS_VERIFICATION_DOMAINS ?? "")
    .toLowerCase().split(",").map((domain) => domain.trim()).filter(Boolean);
  if (!key || !from || !secret || secret.length < 32 || !domains.length) return null;
  return { key, from, secret, domains };
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new VerificationError("Account verification is temporarily unavailable.", 503);
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function checkStorage(error: unknown) {
  if (error) throw new VerificationError("Account verification is temporarily unavailable.", 503);
}

function isExpired(attempt: Attempt) {
  return Date.parse(attempt.expires_at) <= Date.now();
}

function describe(attempt?: Attempt): VerificationDetail {
  if (!attempt) return { status: "ready" };
  const active = attempt.status === "pending" || attempt.status === "starting";
  return {
    status: active && isExpired(attempt) ? "expired" : attempt.status,
    domain: attempt.campus_domain ?? undefined,
    expiresAt: active ? attempt.expires_at : undefined,
    nextStartAt: attempt.status === "verified" ? undefined : new Date(Date.parse(attempt.created_at) + COOLDOWN).toISOString(),
  };
}

function providerURL(origin: string, id: string) {
  return `${origin}/public/ekyc-web/${id}`;
}

function digest(secret: string, ...parts: string[]) {
  return createHmac("sha256", secret).update(JSON.stringify(parts)).digest("hex");
}

export class AccountVerification {
  private readonly db: SupabaseClient;

  constructor(private readonly userId: string) {
    this.db = adminClient();
  }

  async overview(): Promise<VerificationOverview> {
    const aadhaar = aadhaarConfig();
    const email = emailConfig();
    const { data, error } = await this.db.from(TABLE).select("*").eq("user_id", this.userId);
    if (error && !aadhaar && !email && ["PGRST205", "42P01"].includes(error.code)) {
      return {
        aadhaar: { mode: "disabled", status: "ready" },
        identityVerified: false,
        campusEmail: { available: false, status: "ready" },
      };
    }
    checkStorage(error);
    const attempts = (data ?? []) as Attempt[];
    const identity = attempts.find(({ method }) => method === "aadhaar");
    const selected = aadhaar?.mode === "sandbox"
      ? attempts.find(({ method }) => method === "aadhaar_sandbox")
      : identity;
    const aadhaarDetail = describe(selected);
    if (aadhaar && aadhaarDetail.status === "pending" && selected?.provider_request_id) {
      aadhaarDetail.url = providerURL(aadhaar.origin, selected.provider_request_id);
    }
    return {
      aadhaar: { ...aadhaarDetail, mode: aadhaar?.mode ?? "disabled" },
      identityVerified: identity?.status === "verified",
      campusEmail: {
        ...describe(attempts.find(({ method }) => method === "campus_email")),
        available: !!email,
      },
    };
  }

  private async get(method: Method): Promise<Attempt | null> {
    const { data, error } = await this.db.from(TABLE).select("*")
      .eq("user_id", this.userId).eq("method", method).maybeSingle();
    checkStorage(error);
    return data as Attempt | null;
  }

  private async update(attempt: Attempt, patch: Partial<Attempt>, extra?: "code" | "provider") {
    let query = this.db.from(TABLE).update(patch)
      .eq("user_id", this.userId)
      .eq("method", attempt.method)
      .eq("attempt_id", attempt.attempt_id)
      .eq("status", attempt.status);
    if (extra === "code") {
      query = query.eq("failed_attempts", attempt.failed_attempts).gt("expires_at", new Date().toISOString());
    }
    if (extra === "provider") {
      query = query.gt("expires_at", new Date().toISOString());
      query = attempt.last_checked_at
        ? query.eq("last_checked_at", attempt.last_checked_at)
        : query.is("last_checked_at", null);
    }
    const { data, error } = await query.select("attempt_id").maybeSingle();
    checkStorage(error);
    return !!data;
  }

  private async reserve(method: Method, previous: Attempt | null, duration: number, fields: Partial<Attempt> = {}) {
    const now = Date.now();
    if (previous && now < Date.parse(previous.created_at) + COOLDOWN) {
      throw new VerificationError("Please wait one minute before starting another attempt.", 429);
    }
    const attempt: Attempt = {
      user_id: this.userId,
      method,
      attempt_id: randomUUID(),
      status: "starting",
      created_at: new Date(now).toISOString(),
      expires_at: new Date(now + duration).toISOString(),
      verified_at: null,
      last_checked_at: null,
      provider_request_id: null,
      campus_domain: null,
      code_digest: null,
      consent_version: null,
      failed_attempts: 0,
      ...fields,
    };
    if (previous) {
      if (await this.update(previous, attempt)) return attempt;
    } else {
      const { error } = await this.db.from(TABLE).insert(attempt);
      if (!error) return attempt;
      if (error.code !== "23505") checkStorage(error);
    }
    throw new VerificationError("Another request updated this verification. Check its current status and try again.", 409);
  }

  async startAadhaar(consentVersion: unknown) {
    const config = aadhaarConfig();
    if (!config) throw new VerificationError("Aadhaar verification is currently unavailable.", 503);
    if (consentVersion !== AADHAAR_CONSENT_VERSION) {
      throw new VerificationError("Please review and accept the Aadhaar consent to continue.");
    }
    const previous = await this.get(config.method);
    if (previous?.status === "verified" || (previous?.status === "pending" && !isExpired(previous))) return;
    const attempt = await this.reserve(config.method, previous, 30 * 60_000, { consent_version: AADHAAR_CONSENT_VERSION });
    try {
      const response = await fetch(`${config.origin}/api/ekyc/`, {
        method: "POST",
        headers: { ...config.headers, "Content-Type": "application/json" },
        body: JSON.stringify({ redirection_url: config.callback }),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) throw new Error();
      const result = await response.json();
      if (typeof result.id !== "string" || !UUID.test(result.id)
        || result.status !== "CREATED" || result.kycURL !== providerURL(config.origin, result.id)) {
        throw new Error();
      }
      await this.update(attempt, { status: "pending", provider_request_id: result.id });
    } catch {
      await this.update(attempt, { status: "failed" });
      throw new VerificationError("Setu could not start the check. Please try again shortly.", 502);
    }
  }

  async checkAadhaar() {
    const config = aadhaarConfig();
    if (!config) throw new VerificationError("Aadhaar verification is currently unavailable.", 503);
    const attempt = await this.get(config.method);
    if (attempt?.status !== "pending" || !attempt.provider_request_id || isExpired(attempt)) return;
    if (attempt.last_checked_at && Date.now() - Date.parse(attempt.last_checked_at) < 15_000) return;
    const checkedAt = new Date().toISOString();
    if (!await this.update(attempt, { last_checked_at: checkedAt }, "provider")) return;
    let result;
    try {
      const response = await fetch(`${config.origin}/api/ekyc/${attempt.provider_request_id}`, {
        headers: config.headers,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) throw new Error();
      // Setu includes identity data here. Only the bound request ID and status are used.
      result = await response.json();
      if (result.id !== attempt.provider_request_id) throw new Error();
    } catch {
      throw new VerificationError("Setu could not confirm the result yet. Try checking again shortly.", 502);
    }
    const checkedAttempt = { ...attempt, last_checked_at: checkedAt };
    if (result.status === "SUCCESS") {
      await this.update(checkedAttempt, { status: "verified", verified_at: new Date().toISOString() }, "provider");
    } else if (result.status === "ERROR") {
      await this.update(checkedAttempt, { status: "failed" }, "provider");
    }
  }

  async sendEmail(rawEmail: unknown) {
    const config = emailConfig();
    if (!config) throw new VerificationError("Campus email verification is currently unavailable.", 503);
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+$/.test(email)) {
      throw new VerificationError("Enter a valid campus email address.");
    }
    const domain = email.split("@")[1];
    if (!config.domains.includes(domain)) throw new VerificationError("This email domain is not supported by CampusLoop yet.");
    const previous = await this.get("campus_email");
    if (previous?.status === "verified") return;
    const attempt = await this.reserve("campus_email", previous, 10 * 60_000, { campus_domain: domain });
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    try {
      const { data: reserved, error } = await this.db.rpc("reserve_campus_verification_email", {
        p_recipient_digest: digest(config.secret, "recipient", email),
      });
      checkStorage(error);
      if (!reserved) throw new VerificationError("Too many codes were requested for this address. Please try again later.", 429);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          "Idempotency-Key": attempt.attempt_id,
        },
        body: JSON.stringify({
          from: config.from,
          to: [email],
          subject: "Your CampusLoop verification code",
          text: `Your CampusLoop code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
        }),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) throw new VerificationError("The email could not be sent. Please try again shortly.", 502);
      await this.update(attempt, { status: "pending", code_digest: digest(config.secret, "code", this.userId, attempt.attempt_id, code) });
    } catch (error) {
      await this.update(attempt, { status: "failed", code_digest: null });
      if (error instanceof VerificationError) throw error;
      throw new VerificationError("The email could not be sent. Please try again shortly.", 502);
    }
  }

  async confirmEmail(rawCode: unknown) {
    const config = emailConfig();
    if (!config) throw new VerificationError("Campus email verification is currently unavailable.", 503);
    if (typeof rawCode !== "string" || !/^\d{6}$/.test(rawCode)) {
      throw new VerificationError("Enter the six-digit code from your campus inbox.");
    }
    const attempt = await this.get("campus_email");
    if (attempt?.status === "verified") return;
    if (attempt?.status !== "pending" || !attempt.code_digest || isExpired(attempt)) {
      throw new VerificationError("Request a new code and try again.", 409);
    }
    const candidate = digest(config.secret, "code", this.userId, attempt.attempt_id, rawCode);
    const matches = timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(attempt.code_digest, "hex"));
    const failedAttempts = attempt.failed_attempts + 1;
    const locked = failedAttempts >= MAX_CODE_ATTEMPTS;
    const updated = await this.update(attempt, matches
      ? { status: "verified", verified_at: new Date().toISOString(), code_digest: null }
      : { failed_attempts: failedAttempts, ...(locked ? { status: "failed", code_digest: null } : {}) }, "code");
    if (!updated) throw new VerificationError("This code changed or expired. Check your current attempt.", 409);
    if (!matches) {
      throw new VerificationError(locked
        ? "Too many incorrect codes. Request a new one."
        : "That code did not match. Check your inbox and try again.", 422);
    }
  }
}
