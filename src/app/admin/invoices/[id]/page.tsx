import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatGBP } from "@/lib/money";
import { formatInvoiceNo, asLineItems } from "@/lib/invoices";
import { dbDateToKey, formatDisplay } from "@/lib/dates";
import { SITE } from "@/lib/site";
import { PrintButton } from "@/components/admin/InvoiceTools";
import { deleteInvoice } from "../../actions";

export const dynamic = "force-dynamic";

export default async function InvoiceView({ params }: { params: { id: string } }) {
  const [invoice, settings] = await Promise.all([
    prisma.invoice.findUnique({ where: { id: params.id } }),
    getSettings(),
  ]);
  if (!invoice) notFound();
  const items = asLineItems(invoice.lineItems);

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/invoices" className="text-sm text-brand-ink/50 hover:text-brand-purple">← All invoices</Link>
        <div className="flex items-center gap-2">
          <PrintButton />
          <form action={deleteInvoice}>
            <input type="hidden" name="id" value={invoice.id} />
            <button className="rounded-full px-3 py-2 text-sm font-bold text-red-600 ring-1 ring-red-200 hover:bg-red-50">Delete</button>
          </form>
        </div>
      </div>

      <div className="print-area mx-auto max-w-2xl rounded-2xl bg-white p-8 ring-1 ring-black/10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Jumping Jacks Leeds" className="h-16 w-auto" />
            <div>
              <div className="font-display text-lg font-extrabold text-brand-purple">Jumping Jacks Leeds</div>
              <div className="text-xs text-brand-ink/60">Bouncy Castle Hire</div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-display text-2xl font-extrabold text-brand-ink">INVOICE</div>
            <div className="mt-1 text-brand-ink/70">{formatInvoiceNo(invoice.number)}</div>
            <div className="text-brand-ink/50">{formatDisplay(dbDateToKey(invoice.issuedAt))}</div>
          </div>
        </div>

        {/* From / To */}
        <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
          <div>
            <div className="font-bold text-brand-ink/40">From</div>
            <div className="mt-1 font-bold">Jumping Jacks Leeds</div>
            {settings.companyAddress && <div className="whitespace-pre-line text-brand-ink/70">{settings.companyAddress}</div>}
            <div className="text-brand-ink/70">{settings.companyPhone || SITE.phoneDisplay}</div>
            <div className="text-brand-ink/70">{settings.companyEmail || SITE.email}</div>
          </div>
          <div>
            <div className="font-bold text-brand-ink/40">Bill to</div>
            <div className="mt-1 font-bold">{invoice.customerName}</div>
            {invoice.address && <div className="whitespace-pre-line text-brand-ink/70">{invoice.address}</div>}
            {invoice.phone && <div className="text-brand-ink/70">{invoice.phone}</div>}
            {invoice.email && <div className="text-brand-ink/70">{invoice.email}</div>}
          </div>
        </div>

        {/* Items */}
        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black/10 text-left">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-b border-black/5">
                <td className="py-2">{it.description}</td>
                <td className="py-2 text-right">{formatGBP(it.amountPence)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 text-right font-bold">Total</td>
              <td className="pt-4 text-right font-display text-xl font-extrabold text-brand-purple">{formatGBP(invoice.totalPence)}</td>
            </tr>
          </tfoot>
        </table>

        {invoice.notes && <p className="mt-6 whitespace-pre-line text-sm text-brand-ink/70">{invoice.notes}</p>}

        <p className="mt-8 border-t border-black/10 pt-4 text-center text-xs text-brand-ink/50">
          Thank you for choosing Jumping Jacks Leeds — {SITE.phoneDisplay}
        </p>
      </div>
    </div>
  );
}
