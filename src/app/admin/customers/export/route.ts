import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCustomers } from "@/lib/customers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const customers = await getCustomers();
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    ["Name", "Email", "Phone", "Area", "Bookings", "Total spent (GBP)", "Last hire"].join(","),
  ];
  for (const c of customers) {
    lines.push(
      [esc(c.name), esc(c.email), esc(c.phone), esc(c.postcode), c.bookings, (c.totalPence / 100).toFixed(2), c.lastDate].join(","),
    );
  }
  const csv = lines.join("\r\n");
  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jumping-jacks-customers-${today}.csv"`,
    },
  });
}
