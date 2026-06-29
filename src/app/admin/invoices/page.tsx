import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatGBP } from "@/lib/money";
import { formatInvoiceNo } from "@/lib/invoices";
import { dbDateToKey, formatDisplay } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function AdminInvoices() {
  const invoices = await prisma.invoice.findMany({ orderBy: { number: "desc" }, take: 300 });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Invoices</h2>
        <Link href="/admin/invoices/new" className="btn-primary !py-2 text-sm">+ New invoice</Link>
      </div>
      <p className="mt-2 text-sm text-brand-ink/60">
        Create a one-off invoice here, or generate one from any paid booking (Bookings → Invoice).
      </p>

      {invoices.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-brand-violet/5 p-6 text-brand-ink/60">No invoices yet.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/admin/invoices/${inv.id}`}
              className="card flex items-center justify-between gap-3 p-4 transition hover:ring-brand-purple/20"
            >
              <div className="min-w-0">
                <div className="font-display text-base font-extrabold">
                  {formatInvoiceNo(inv.number)}
                  <span className="ml-2 text-sm font-normal text-brand-ink/50">{inv.customerName}</span>
                </div>
                <div className="text-sm text-brand-ink/50">
                  {formatDisplay(dbDateToKey(inv.issuedAt))}
                  {inv.bookingId ? " · from booking" : " · custom"}
                </div>
              </div>
              <span className="shrink-0 font-display text-lg font-extrabold text-brand-purple">
                {formatGBP(inv.totalPence)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
