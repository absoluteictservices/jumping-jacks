"use client";

import { useState } from "react";

type Row = { description: string; amount: string };

/** Editable list of invoice line items; serialises to a hidden "lineItems" JSON field. */
export function InvoiceItemsField() {
  const [rows, setRows] = useState<Row[]>([{ description: "", amount: "" }]);

  const update = (i: number, key: keyof Row, val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));

  const total = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  return (
    <div>
      <input type="hidden" name="lineItems" value={JSON.stringify(rows)} />
      <label className="block text-sm font-bold text-brand-ink/80">Line items</label>
      <div className="mt-2 space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={row.description}
              onChange={(e) => update(i, "description", e.target.value)}
              placeholder="Description (e.g. Spider-Man Castle hire)"
              className="flex-1 rounded-xl border border-black/10 px-3 py-2"
            />
            <div className="relative w-32">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40">£</span>
              <input
                value={row.amount}
                onChange={(e) => update(i, "amount", e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                className="w-full rounded-xl border border-black/10 py-2 pl-7 pr-3"
              />
            </div>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-xl px-2 text-brand-ink/40 hover:text-red-600"
                aria-label="Remove line"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setRows((r) => [...r, { description: "", amount: "" }])}
          className="text-sm font-bold text-brand-purple hover:underline"
        >
          + Add line
        </button>
        <span className="text-sm font-bold text-brand-ink">Total: £{total.toFixed(2)}</span>
      </div>
    </div>
  );
}

/** Print/Save-as-PDF button (hidden when printing). */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary no-print">
      Print / Save as PDF
    </button>
  );
}
