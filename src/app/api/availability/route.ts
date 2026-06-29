import { NextRequest, NextResponse } from "next/server";
import { getMonthAvailability } from "@/lib/availability.server";

export const dynamic = "force-dynamic";

// GET /api/availability?inflatableId=...&month=YYYY-MM
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const inflatableId = searchParams.get("inflatableId");
  const month = searchParams.get("month");

  if (!inflatableId || !month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "inflatableId and month=YYYY-MM are required" }, { status: 400 });
  }

  try {
    const days = await getMonthAvailability(inflatableId, `${month}-01`);
    return NextResponse.json({ days });
  } catch (e) {
    console.error("availability error", e);
    return NextResponse.json({ error: "Could not load availability" }, { status: 500 });
  }
}
