import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { releaseExpiredHolds } from "@/lib/availability.server";
import { formatDisplay, dbDateToKey, todayKey, dateKeyToUTCDate } from "@/lib/dates";
import { formatGBP } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  await releaseExpiredHolds();
  const today = dateKeyToUTCDate(todayKey());

  const [upcoming, activeHolds, paidCount, revenue] = await Promise.all([
    prisma.booking.findMany({
      where: { status: "paid", date: { gte: today } },
      include: { inflatable: true },
      orderBy: { date: "asc" },
      take: 30,
    }),
    prisma.booking.count({ where: { status: "held", holdExpiresAt: { gt: new Date() } } }),
    prisma.booking.count({ where: { status: "paid" } }),
    prisma.booking.aggregate({ where: { status: "paid" }, _sum: { totalPence: true } }),
  ]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Upcoming deliveries" value={String(upcoming.length)} />
        <Stat label="Active holds" value={String(activeHolds)} />
        <Stat label="Total paid bookings" value={String(paidCount)} />
        <Stat label="Total revenue" value={formatGBP(revenue._sum.totalPence ?? 0)} />
      </div>

      <h2 className="mt-10 text-xl">Upcoming deliveries</h2>
      {upcoming.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-brand-violet/5 p-6 text-brand-ink/60">No upcoming paid bookings.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-brand-ink/50">
              <tr className="border-b border-black/10">
                <Th>Date</Th><Th>Time</Th><Th>Inflatable</Th><Th>Customer</Th><Th>Postcode</Th><Th>Phone</Th><Th>Paid</Th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((b) => (
                <tr key={b.id} className="border-b border-black/5">
                  <Td className="font-bold">{formatDisplay(dbDateToKey(b.date))}</Td>
                  <Td className="text-brand-ink/60">{b.deliveryTime ?? "—"}</Td>
                  <Td>{b.inflatable.name}</Td>
                  <Td>{b.customerName}</Td>
                  <Td>{b.deliveryPostcode}</Td>
                  <Td><a href={`tel:${b.phone}`} className="text-brand-purple">{b.phone}</a></Td>
                  <Td>{formatGBP(b.totalPence)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Link href="/admin/bookings" className="font-bold text-brand-purple hover:underline">View all bookings →</Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-brand-ink/50">{label}</div>
      <div className="mt-1 font-display text-2xl font-extrabold text-brand-ink">{value}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-bold">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
