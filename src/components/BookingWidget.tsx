"use client";

import { useEffect, useState, useCallback } from "react";
import { SITE, DELIVERY_TIME_OPTIONS } from "@/lib/site";

type Day = { date: string; available: boolean; reason?: string };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function monthKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
function monthLabel(d: Date) {
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}
function displayDate(key: string) {
  const [y, m, dd] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, dd)).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}
// Monday-based weekday index (0=Mon..6=Sun) of the 1st of the month.
function leadingBlanks(d: Date) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1).getDay(); // 0=Sun
  return (first + 6) % 7;
}

export function BookingWidget({
  inflatableId,
  name,
  pricePerDay,
}: {
  inflatableId: string;
  name: string;
  pricePerDay: number | null;
}) {
  const [cursor, setCursor] = useState(() => new Date());
  const [days, setDays] = useState<Record<string, Day>>({});
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const thisMonthKey = monthKey(new Date());
  const atCurrentMonth = monthKey(cursor) <= thisMonthKey;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/availability?inflatableId=${inflatableId}&month=${monthKey(cursor)}`);
      const data = await res.json();
      const map: Record<string, Day> = {};
      (data.days as Day[]).forEach((d) => (map[d.date] = d));
      setDays(map);
    } catch {
      setError("Couldn't load availability. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [inflatableId, cursor]);

  useEffect(() => {
    load();
  }, [load]);

  if (pricePerDay == null) {
    return (
      <div className="card p-6 text-center">
        <p className="font-bold text-brand-ink">Online booking coming soon for this castle.</p>
        <p className="mt-2 text-sm text-brand-ink/70">Give us a call and we'll get you booked in.</p>
        <a href={`tel:${SITE.phone}`} className="btn-primary mt-4">Call {SITE.phoneDisplay}</a>
      </div>
    );
  }

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = leadingBlanks(cursor);

  async function submit(form: FormData) {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inflatableId,
          date: selected,
          customerName: form.get("customerName"),
          email: form.get("email"),
          phone: form.get("phone"),
          deliveryAddress: form.get("deliveryAddress"),
          deliveryPostcode: form.get("deliveryPostcode"),
          deliveryTime: form.get("deliveryTime"),
          notes: form.get("notes"),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        // Refresh calendar in case the slot was taken.
        load();
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between border-b border-black/5 p-4">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          disabled={atCurrentMonth}
          className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-black/10 disabled:opacity-30"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="font-display text-lg font-extrabold">{monthLabel(cursor)}</div>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-black/10"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-brand-ink/50">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">{w}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1" aria-busy={loading}>
          {Array.from({ length: blanks }).map((_, i) => (
            <div key={`b${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const key = `${year}-${pad(month + 1)}-${pad(i + 1)}`;
            const day = days[key];
            const available = day?.available;
            const isSelected = selected === key;
            return (
              <button
                key={key}
                type="button"
                disabled={!available}
                onClick={() => setSelected(key)}
                aria-pressed={isSelected}
                aria-label={`${displayDate(key)}${available ? " — available" : " — unavailable"}`}
                className={[
                  "aspect-square rounded-xl text-sm font-bold transition",
                  isSelected ? "bg-brand-pink text-white shadow-playful" : "",
                  !isSelected && available ? "bg-brand-green/15 text-brand-ink hover:bg-brand-green/30" : "",
                  !available ? "cursor-not-allowed bg-black/[.03] text-black/25 line-through" : "",
                ].join(" ")}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-brand-ink/60">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-brand-green/30" /> Available</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-black/10" /> Unavailable</span>
        </div>
      </div>

      {/* Details form */}
      {selected && (
        <form
          action={submit}
          className="border-t border-black/5 bg-brand-violet/5 p-5"
        >
          <p className="font-bold text-brand-ink">
            Booking <span className="text-brand-purple">{name}</span> for <span className="text-brand-purple">{displayDate(selected)}</span>
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field name="customerName" label="Your name" required />
            <Field name="phone" label="Phone" type="tel" required />
            <Field name="email" label="Email" type="email" required />
            <Field name="deliveryPostcode" label="Delivery postcode" required />
            <div className="sm:col-span-2">
              <Field name="deliveryAddress" label="Delivery address" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-brand-ink/80" htmlFor="deliveryTime">
                Preferred delivery time
              </label>
              <select
                id="deliveryTime"
                name="deliveryTime"
                defaultValue={DELIVERY_TIME_OPTIONS[0]}
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              >
                {DELIVERY_TIME_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-brand-ink/50">Full-day hire — we'll do our best to deliver at your preferred time and confirm the day before.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-brand-ink/80" htmlFor="notes">Notes (optional)</label>
              <textarea id="notes" name="notes" rows={2} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2" placeholder="Surface (grass/hard), access, anything we should know" />
            </div>
          </div>
          {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full">
            {submitting ? "Redirecting to secure payment…" : `Pay & book — £${(pricePerDay / 100).toFixed(0)}`}
          </button>
          <p className="mt-2 text-center text-xs text-brand-ink/50">
            Secure payment by Stripe. Your date is held for 15 minutes while you pay.
          </p>
        </form>
      )}
    </div>
  );
}

function Field({
  name, label, type = "text", required,
}: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-bold text-brand-ink/80" htmlFor={name}>
        {label}{required && <span className="text-brand-pink"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
      />
    </div>
  );
}
