import { saveInflatable } from "../actions";
import { formatGBP } from "@/lib/money";

type InflatableData = {
  id: string;
  name: string;
  description: string;
  theme: string | null;
  dimensions: string | null;
  ageSuitability: string | null;
  pricePerDay: number | null;
  images: string[];
  active: boolean;
  sortOrder: number;
};

export function InflatableForm({ inflatable }: { inflatable?: InflatableData }) {
  const i = inflatable;
  return (
    <form action={saveInflatable} className="card max-w-2xl space-y-4 p-6">
      {i && <input type="hidden" name="id" value={i.id} />}

      <Field label="Name" name="name" defaultValue={i?.name} required />

      <div>
        <label className="block text-sm font-bold text-brand-ink/80" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={4} defaultValue={i?.description} required
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Theme" name="theme" defaultValue={i?.theme ?? ""} placeholder="e.g. Superhero" />
        <Field label="Dimensions" name="dimensions" defaultValue={i?.dimensions ?? ""} placeholder="e.g. 12ft x 12ft" />
        <Field label="Age suitability" name="ageSuitability" defaultValue={i?.ageSuitability ?? ""} placeholder="e.g. Up to 12 years" />
        <Field label="Price per day (£)" name="pricePerDay" defaultValue={i?.pricePerDay != null ? (i.pricePerDay / 100).toString() : ""} placeholder="Leave blank for 'Call to book'" />
      </div>

      <div>
        <label className="block text-sm font-bold text-brand-ink/80" htmlFor="images">Image URLs (one per line)</label>
        <textarea id="images" name="images" rows={3} defaultValue={i?.images.join("\n")}
          placeholder="https://…/spiderman-1.jpg" className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 font-mono text-xs" />
        <p className="mt-1 text-xs text-brand-ink/50">Paste hosted image URLs. No images = a colourful placeholder is shown.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sort order" name="sortOrder" type="number" defaultValue={String(i?.sortOrder ?? 0)} />
        <label className="flex items-center gap-2 pt-6">
          <input type="checkbox" name="active" defaultChecked={i ? i.active : true} className="h-5 w-5 rounded" />
          <span className="font-bold text-brand-ink/80">Active (visible on site)</span>
        </label>
      </div>

      {i && <p className="text-xs text-brand-ink/40">Current price: {formatGBP(i.pricePerDay)}</p>}

      <div className="flex gap-3">
        <button className="btn-primary">Save</button>
        <a href="/admin/inflatables" className="btn-secondary">Cancel</a>
      </div>
    </form>
  );
}

function Field({
  label, name, defaultValue, placeholder, type = "text", required,
}: { label: string; name: string; defaultValue?: string; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-bold text-brand-ink/80" htmlFor={name}>
        {label}{required && <span className="text-brand-pink"> *</span>}
      </label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required}
        className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2" />
    </div>
  );
}
