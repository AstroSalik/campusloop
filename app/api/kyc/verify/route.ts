import { NextRequest, NextResponse } from "next/server";
import { AccountVerification, VerificationError } from "@/lib/account-verification";
import { createClient } from "@/lib/supabase/server";

function reply(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function getVerification() {
  const { data: { user }, error } = await createClient().auth.getUser();
  if (error || !user) throw new VerificationError("Sign in to use account verification.", 401);
  return new AccountVerification(user.id);
}

function failure(error: unknown) {
  if (error instanceof VerificationError) return reply({ error: error.message }, error.status);
  return reply({ error: "Account verification is temporarily unavailable." }, 503);
}

async function readAction(request: NextRequest) {
  const reader = request.body?.getReader();
  if (!reader) throw new VerificationError("Send a verification action.");
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 1024) {
      await reader.cancel();
      throw new VerificationError("The verification request is too large.", 413);
    }
    text += decoder.decode(value, { stream: true });
  }
  try {
    const body = JSON.parse(text + decoder.decode());
    if (!body || typeof body.action !== "string") throw new Error();
    return body;
  } catch {
    throw new VerificationError("Send a supported verification action.");
  }
}

function isSameOrigin(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    return (origin.protocol === "http:" || origin.protocol === "https:")
      && (origin.host === request.headers.get("host") || origin.origin === process.env.VERIFICATION_APP_ORIGIN);
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    return reply(await (await getVerification()).overview());
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return reply({ error: "Open your CampusLoop profile to continue." }, 403);
  }
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") {
    return reply({ error: "Send a JSON verification action." }, 415);
  }

  try {
    const verification = await getVerification();
    const body = await readAction(request);
    switch (body.action) {
      case "start-aadhaar":
        await verification.startAadhaar(body.consentVersion);
        break;
      case "check-aadhaar":
        await verification.checkAadhaar();
        break;
      case "send-email":
        await verification.sendEmail(body.email);
        break;
      case "confirm-email":
        await verification.confirmEmail(body.code);
        break;
      default:
        throw new VerificationError("Send a supported verification action.");
    }
    return reply(await verification.overview());
  } catch (error) {
    return failure(error);
  }
}
