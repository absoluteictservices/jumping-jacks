import Link from "next/link";
import { createCustomInvoice } from "../../actions";
import { InvoiceItemsField } from "@/components/admin/InvoiceTools";

export const dynamic = "force-dynamic";

export default function NewInvoice() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/invoices" className="text-sm text-brand-ink/50 hover:text-brand-purple">← All invoices</Link>
      <h2 className="mt-2 text-xl">New invoice</h2>
      <p className="mt-1 text-sm text-brand-ink/60">For off-site, cash or custom jobs not booked online.</p>

      <form action={createCustomInvoice} className="card mt-4 space-y-4 p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="customerName" label="Customer name" required />
          <Field name="phone" label="Phone" />
          <Field name="email" label="Email" type="email" />
          <Field name="address" label="Address" />
        </div>

        <InvoiceItemsField />

        <div>
          <label htmlFor="notes" className="block text-sm font-bold text-brand-ink/80">Notes (optional)</label>
          <textarea id="notes" name="notes" rows={2} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2" placeholder="Payment terms, thank-you note, etc." />
        </div>

        <div className="flex gap-3">
          <button className="btn-primary">Create invoice</button>
          <Link href="/admin/invoices" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-bold text-brand-ink/80">
        {label}{required && <span className="text-brand-pink"> *</span>}
      </label>
      <input id={name} name={name} type={type} required={required} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2" />
    </div>
  );
}
