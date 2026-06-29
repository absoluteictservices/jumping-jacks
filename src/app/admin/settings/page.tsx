import { getSettings } from "@/lib/settings";
import { saveSettings } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminSettings({ searchParams }: { searchParams: { saved?: string } }) {
  const s = await getSettings();

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl">Settings</h2>
      {searchParams.saved && (
        <p className="mt-3 rounded-xl bg-brand-green/15 px-3 py-2 text-sm font-bold text-green-700">Settings saved.</p>
      )}

      <form action={saveSettings} className="card mt-4 space-y-5 p-6">
        <Number
          label="Max deliveries per day (the “one van” rule)"
          name="maxDeliveriesPerDay"
          defaultValue={s.maxDeliveriesPerDay}
          min={1}
          help="When this many bookings exist on a date, that date becomes unavailable for ALL inflatables. Raise it if you add capacity."
        />
        <Number
          label="Minimum lead time (days)"
          name="minLeadTimeDays"
          defaultValue={s.minLeadTimeDays}
          min={0}
          help="0 = same-day bookings allowed. 1 = bookable from tomorrow onward."
        />
        <Number
          label="Hold time during checkout (minutes)"
          name="holdMinutes"
          defaultValue={s.holdMinutes}
          min={5}
          help="How long a date is reserved while a customer pays."
        />

        <div>
          <label htmlFor="deliveryPostcodePrefixes" className="block text-sm font-bold text-brand-ink/80">Delivery postcode prefixes</label>
          <textarea
            id="deliveryPostcodePrefixes"
            name="deliveryPostcodePrefixes"
            rows={2}
            defaultValue={s.deliveryPostcodePrefixes.join(", ")}
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2"
            placeholder="LS"
          />
          <p className="mt-1 text-xs text-brand-ink/50">Comma or newline separated, e.g. <code>LS, WF, BD</code>. Leave blank to accept any postcode.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Company email" name="companyEmail" defaultValue={s.companyEmail} />
          <Text label="Company phone" name="companyPhone" defaultValue={s.companyPhone} />
        </div>

        <div>
          <label htmlFor="companyAddress" className="block text-sm font-bold text-brand-ink/80">Company address (shown on invoices)</label>
          <textarea id="companyAddress" name="companyAddress" rows={3} defaultValue={s.companyAddress}
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2" placeholder="e.g. 12 Example Street, Leeds, LS1 1AA" />
        </div>

        <div>
          <label htmlFor="cancellationPolicy" className="block text-sm font-bold text-brand-ink/80">Cancellation policy text</label>
          <textarea id="cancellationPolicy" name="cancellationPolicy" rows={5} defaultValue={s.cancellationPolicy}
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2" />
          <p className="mt-1 text-xs text-brand-ink/50">Shown to customers. Please replace the placeholder wording before launch.</p>
        </div>

        <button className="btn-primary">Save settings</button>
      </form>
    </div>
  );
}

function Number({ label, name, defaultValue, min, help }: { label: string; name: string; defaultValue: number; min: number; help?: string }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-bold text-brand-ink/80">{label}</label>
      <input id={name} name={name} type="number" min={min} defaultValue={defaultValue} className="mt-1 w-40 rounded-xl border border-black/10 px-3 py-2" />
      {help && <p className="mt-1 text-xs text-brand-ink/50">{help}</p>}
    </div>
  );
}
function Text({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-bold text-brand-ink/80">{label}</label>
      <input id={name} name={name} defaultValue={defaultValue} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2" />
    </div>
  );
}
