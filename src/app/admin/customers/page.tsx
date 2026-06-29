import { getCustomers } from "@/lib/customers";
import { formatGBP } from "@/lib/money";
import { formatDisplay } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function AdminCustomers() {
  const customers = await getCustomers();
  const totalSpent = customers.reduce((s, c) => s + c.totalPence, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl">Customers</h2>
        {customers.length > 0 && (
          <a href="/admin/customers/export" className="btn-secondary !py-2 text-sm">Download CSV</a>
        )}
      </div>
      <p className="mt-2 text-sm text-brand-ink/60">
        Everyone who has booked, automatically collected and de-duplicated by email. Export the list for your own marketing
        (remember to only contact people who are happy to hear from you).
      </p>

      {customers.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Customers" value={String(customers.length)} />
          <Stat label="Total bookings" value={String(customers.reduce((s, c) => s + c.bookings, 0))} />
          <Stat label="Total revenue" value={formatGBP(totalSpent)} />
        </div>
      )}

      {customers.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-brand-violet/5 p-6 text-brand-ink/60">No customers yet — they’ll appear here automatically after their first paid booking.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-brand-ink/50">
              <tr className="border-b border-black/10">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Area</th>
                <th className="px-3 py-2">Bookings</th>
                <th className="px-3 py-2">Spent</th>
                <th className="px-3 py-2">Last hire</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email + c.phone} className="border-b border-black/5">
                  <td className="px-3 py-2 font-bold">{c.name}</td>
                  <td className="px-3 py-2"><a href={`mailto:${c.email}`} className="text-brand-purple">{c.email}</a></td>
                  <td className="px-3 py-2"><a href={`tel:${c.phone}`} className="text-brand-purple">{c.phone}</a></td>
                  <td className="px-3 py-2">{c.postcode}</td>
                  <td className="px-3 py-2">{c.bookings}</td>
                  <td className="px-3 py-2">{formatGBP(c.totalPence)}</td>
                  <td className="px-3 py-2">{formatDisplay(c.lastDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
