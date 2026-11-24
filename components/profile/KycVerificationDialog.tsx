"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Fingerprint, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AADHAAR_CONSENT_VERSION, type VerificationAction, type VerificationDetail, type VerificationOverview } from "@/lib/verification";

const endpoint = "/api/kyc/verify";

export async function getVerification(): Promise<VerificationOverview> {
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) throw new Error("Couldn’t load your verification status.");
  return response.json();
}

async function submit(action: VerificationAction): Promise<VerificationOverview> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.error || "Something went wrong. Please try again.");
  return data;
}

function cooldown(detail: VerificationDetail, now: number) {
  return detail.nextStartAt ? Math.max(0, Math.ceil((Date.parse(detail.nextStartAt) - now) / 1000)) : 0;
}

interface Props {
  onOpenChange: (open: boolean) => void;
  onStatus: (status: VerificationOverview) => void;
  returning: boolean;
}

export function KycVerificationDialog({ onOpenChange, onStatus, returning }: Props) {
  const [step, setStep] = useState<"choose" | "aadhaar" | "email">(returning ? "aadhaar" : "choose");
  const [overview, setOverview] = useState<VerificationOverview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [consent, setConsent] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [changeEmail, setChangeEmail] = useState(false);
  const [now, setNow] = useState(Date.now);
  const autoCheck = useRef(returning);

  const update = useCallback((status: VerificationOverview) => {
    setOverview(status);
    onStatus(status);
    setNow(Date.now());
  }, [onStatus]);

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const status = await getVerification();
      update(status);
      if (autoCheck.current && status.aadhaar.mode !== "disabled" && status.aadhaar.status === "pending") {
        autoCheck.current = false;
        update(await submit({ action: "check-aadhaar" }));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn’t load your verification status.");
    } finally {
      setBusy(false);
    }
  }, [update]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!overview) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [overview]);

  async function run(action: VerificationAction) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const status = await submit(action);
      update(status);
      if (action.action === "start-aadhaar" && status.aadhaar.url) {
        window.location.assign(status.aadhaar.url);
      }
      if (action.action === "send-email") {
        setCode("");
        setChangeEmail(false);
      }
      if (action.action === "confirm-email") setCode("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
      try { update(await getVerification()); } catch { /* Keep displaying the original error. */ }
    } finally {
      setBusy(false);
    }
  }

  const aadhaar = overview?.aadhaar;
  const campus = overview?.campusEmail;
  const sandbox = aadhaar?.mode === "sandbox";
  const aadhaarWait = aadhaar ? cooldown(aadhaar, now) : 0;
  const emailWait = campus ? cooldown(campus, now) : 0;
  const emailPending = campus?.status === "pending" && Date.parse(campus.expiresAt ?? "") > now;
  const aadhaarPending = aadhaar?.status === "pending" && Date.parse(aadhaar.expiresAt ?? "") > now;

  function choose(next: typeof step) {
    setError("");
    setStep(next);
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl p-5 sm:p-7">
        <DialogHeader className="pr-5 text-left">
          <DialogTitle className="text-xl tracking-tight">
            {step === "aadhaar" ? "Aadhaar identity check" : step === "email" ? "Campus email" : "Account verification"}
          </DialogTitle>
          <DialogDescription>
            {step === "choose" ? "Confirm your campus email or complete an optional identity check."
              : step === "aadhaar" ? "Setu hosts the check and returns its result to CampusLoop."
              : "Confirm access to an email address issued by a supported campus."}
          </DialogDescription>
        </DialogHeader>

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-950/60 dark:text-red-300">{error}</p>}

        {!overview && (busy
          ? <p role="status" className="flex items-center gap-2 py-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> Checking your status…</p>
          : <Button onClick={() => void load()}>Try again</Button>)}

        {overview && step === "choose" && (
          <div className="divide-y divide-border rounded-xl border border-border">
            <Method icon={Mail} label="Campus email" detail={campus?.status === "verified"
              ? `Confirmed · ${campus.domain}` : campus?.available ? "Confirm your campus inbox" : "Currently unavailable"}
              verified={campus?.status === "verified"} onClick={() => choose("email")} />
            <Method icon={Fingerprint} label="Aadhaar identity" detail={sandbox
              ? "Sandbox · test data only" : overview.identityVerified ? "Identity check complete"
              : aadhaar?.mode === "production" ? "Optional · hosted by Setu" : "Currently unavailable"}
              verified={overview.identityVerified && !sandbox} onClick={() => choose("aadhaar")} />
          </div>
        )}

        {aadhaar && step === "aadhaar" && (
          <div className="space-y-4">
            {sandbox && <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
              Sandbox only. Use provider test data. A completed test gives you no identity badge.
            </p>}
            {aadhaar.status === "verified" ? (
              <p role="status" className="flex items-center gap-2 text-sm font-medium text-primary">
                <Check className="h-4 w-4" /> {sandbox ? "Sandbox check complete" : "Identity check complete"}
              </p>
            ) : aadhaar.mode === "disabled" ? (
              <p className="text-sm text-muted-foreground">Aadhaar verification is currently unavailable. You can still use CampusLoop and confirm a supported campus email when available.</p>
            ) : aadhaarPending && aadhaar.url ? (
              <>
                <p role="status" className="text-sm text-muted-foreground">{busy
                  ? "Checking with Setu…" : "Your check is still open. Continue on Setu or check for the result if you’ve finished."}</p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <a href={aadhaar.url} referrerPolicy="no-referrer">Resume on Setu <ArrowUpRight className="h-4 w-4" /></a>
                  </Button>
                  <Button variant="outline" disabled={busy} onClick={() => void run({ action: "check-aadhaar" })}>Check status</Button>
                </div>
              </>
            ) : (
              <>
                {aadhaar.status === "failed" && <p className="text-sm text-muted-foreground">The last check ended. You can start a new one.</p>}
                {(aadhaar.status === "expired" || aadhaar.status === "pending") && <p className="text-sm text-muted-foreground">The previous link has expired.</p>}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Enter your Aadhaar details only on Setu. This optional check confirms identity. CampusLoop keeps the result, a request reference and your consent.
                </p>
                <a href="/privacy#account-verification" target="_blank" rel="noreferrer" className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline">
                  How we handle verification data <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </a>
                <label className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-teal-700" />
                  I agree to use Setu for this identity check.
                </label>
                <Button disabled={!consent || busy || !!aadhaarWait}
                  onClick={() => void run({ action: "start-aadhaar", consentVersion: AADHAAR_CONSENT_VERSION })}>
                  {busy ? "Connecting…" : aadhaarWait ? `Try again in ${aadhaarWait}s` : "Continue to Setu"}
                  {!busy && !aadhaarWait && <ArrowUpRight className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>
        )}

        {campus && step === "email" && (
          <div className="space-y-3">
            {campus.status === "verified" ? (
              <p role="status" className="flex items-center gap-2 text-sm font-medium text-primary">
                <Check className="h-4 w-4" /> Campus email confirmed · {campus.domain}
              </p>
            ) : !campus.available ? (
              <p className="text-sm text-muted-foreground">Campus email verification is currently unavailable.</p>
            ) : emailPending && !changeEmail ? (
              <form className="space-y-3" onSubmit={(event) => {
                event.preventDefault();
                void run({ action: "confirm-email", code });
              }}>
                <p className="text-sm text-muted-foreground">Enter the code sent to your @{campus.domain} inbox. It expires 10 minutes after sending.</p>
                <label htmlFor="campus-verification-code" className="text-sm font-medium">Verification code</label>
                <Input id="campus-verification-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                  value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} />
                <div className="flex flex-wrap items-center gap-2">
                  <Button disabled={busy || code.length !== 6}>{busy ? "Checking…" : "Confirm email"}</Button>
                  <Button type="button" variant="ghost" disabled={busy || !!emailWait}
                    onClick={() => { setChangeEmail(true); setError(""); }}>Request another code</Button>
                </div>
              </form>
            ) : (
              <form className="space-y-3" onSubmit={(event) => {
                event.preventDefault();
                void run({ action: "send-email", email });
              }}>
                {campus.expiresAt && !emailPending && <p className="text-sm text-muted-foreground">The previous code has expired.</p>}
                <label htmlFor="campus-verification-email" className="text-sm font-medium">Campus email address</label>
                <Input id="campus-verification-email" type="email" autoComplete="email" maxLength={254}
                  value={email} onChange={(event) => setEmail(event.target.value)} required />
                <Button disabled={busy || !email.trim() || !!emailWait}>
                  {busy ? "Sending…" : emailWait ? `Try again in ${emailWait}s` : "Send code"}
                </Button>
              </form>
            )}
          </div>
        )}

        {step !== "choose" && (
          <button type="button" onClick={() => choose("choose")}
            className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Verification options
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Method({ icon: Icon, label, detail, verified, onClick }: {
  icon: typeof Mail;
  label: string;
  detail: string;
  verified: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-3.5 text-left transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary">
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block break-words text-sm text-muted-foreground">{detail}</span>
      </span>
      {verified ? <Check className="h-4 w-4 text-primary" /> : <ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}
