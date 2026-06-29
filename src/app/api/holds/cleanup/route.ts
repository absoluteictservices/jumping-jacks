import { NextRequest, NextResponse } from "next/server";
import { releaseExpiredHolds } from "@/lib/availability.server";

export const dynamic = "force-dynamic";

// Called by Vercel Cron (see vercel.json). Also safe to hit manually.
// Protected by CRON_SECRET passed as ?secret= or Bearer token.
async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided =
    new URL(req.url).searchParams.get("secret") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret && provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const released = await releaseExpiredHolds();
  return NextResponse.json({ released });
}

export const GET = handle;
export const POST = handle;
