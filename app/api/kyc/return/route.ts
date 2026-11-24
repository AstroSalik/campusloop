import { NextResponse } from "next/server";

export function GET() {
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: "/profile?verification=return",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
