import { prisma } from "./prisma";
import { dbDateToKey } from "./dates";

export type CustomerRow = {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  bookings: number;
  totalPence: number;
  lastDate: string;
};

/**
 * A clean, de-duplicated list of real (paid) customers, built from bookings.
 * De-duped by email (falling back to phone). Most-recent details win.
 */
export async function getCustomers(): Promise<CustomerRow[]> {
  const rows = await prisma.booking.findMany({
    where: { status: "paid" },
    orderBy: { date: "desc" },
    select: {
      customerName: true,
      email: true,
      phone: true,
      deliveryPostcode: true,
      totalPence: true,
      date: true,
    },
  });

  const map = new Map<string, CustomerRow>();
  for (const b of rows) {
    const key = (b.email || "").trim().toLowerCase() || (b.phone || "").replace(/\s+/g, "");
    if (!key) continue;
    const dateKey = dbDateToKey(b.date);
    const existing = map.get(key);
    if (!existing) {
      // rows are date-desc, so the first occurrence holds the most recent details
      map.set(key, {
        name: b.customerName,
        email: b.email || "",
        phone: b.phone || "",
        postcode: b.deliveryPostcode || "",
        bookings: 1,
        totalPence: b.totalPence,
        lastDate: dateKey,
      });
    } else {
      existing.bookings += 1;
      existing.totalPence += b.totalPence;
      if (dateKey > existing.lastDate) existing.lastDate = dateKey;
    }
  }
  return [...map.values()].sort((a, b) => b.lastDate.localeCompare(a.lastDate));
}
