import { prisma } from "@/lib/prisma";
import { releaseExpiredHolds } from "@/lib/availability.server";
import { formatDisplay, dbDateToKey } from "@/lib/dates";
import { formatGBP } from "@/lib/money";
import { cancelBooking, createInvoiceFromBooking } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-brand-green/15 text-green-700",
  held: "bg-brand-yellow/30 text-yellow-800",
  cancelled: "bg-black/5 text-black/40 line-through",
};

export default async function AdminBookings({ searchParams }: { searchParams: { status?: string } }) {
  await releaseExpiredHolds();
  const status = searchParams.status;
  const where = status && ["paid", "held", "cancelled"].includes(status) ? { status: status as never } : {};
  const bookings = await prisma.booking.findMany({
    where,
    include: { inflatable: true },
    orderBy: [{ date: "desc" }],
    take: 200,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl">Bookings</h2>
        <div className="flex gap-2 text-sm">
          {[
            { k: "", label: "All" },
            { k: "paid", label: "Paid" },
            { k: "held", label: "Held" },
            { k: "cancelled", label: "Cancelled" },
          ].map((f) => (
            <a
              key={f.k}
              href={`/admin/bookings${f.k ? `?status=${f.k}` : ""}`}
              className={`rounded-full px-3 py-1.5 font-bold ${(status ?? "") === f.k ? "bg-brand-purple text-white" : "bg-brand-violet/10 text-brand-purple"}`}
            >
              {f.label}
            </a>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-brand-violet/5 p-6 text-brand-ink/60">No bookings found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-brand-ink/50">
              <tr className="border-b border-black/10">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Inflatable</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Delivery</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-black/5 align-top">
                  <td className="px-3 py-2 font-bold">
                    {formatDisplay(dbDateToKey(b.date))}
                    {b.deliveryTime && <span className="block text-xs font-normal text-brand-ink/50">{b.deliveryTime}</span>}
                  </td>
                  <td className="px-3 py-2">{b.inflatable.name}</td>
                  <td className="px-3 py-2">{b.customerName}</td>
                  <td className="px-3 py-2">
                    <a href={`tel:${b.phone}`} className="block text-brand-purple">{b.phone}</a>
                    <a href={`mailto:${b.email}`} className="block text-xs text-brand-ink/50">{b.email}</a>
                  </td>
                  <td className="px-3 py-2 text-xs">{b.deliveryAddress}, {b.deliveryPostcode}</td>
                  <td className="px-3 py-2">{formatGBP(b.totalPence)}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${STATUS_STYLE[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <form action={createInvoiceFromBooking}>
                        <input type="hidden" name="bookingId" value={b.id} />
                        <button className="text-xs font-bold text-brand-purple hover:underline">Invoice</button>
                      </form>
                      {b.status !== "cancelled" && (
                        <form action={cancelBooking}>
                          <input type="hidden" name="id" value={b.id} />
                          <button className="text-xs font-bold text-red-600 hover:underline">Cancel</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-brand-ink/40">Cancelling a paid booking frees the date but does not issue a Stripe refund — process refunds in your Stripe dashboard.</p>
    </div>
  );
}
