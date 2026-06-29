import { prisma } from "./prisma";

export type LineItem = { description: string; amountPence: number };

/** Next sequential invoice number (starts at 1001 so it doesn't look brand-new). */
export async function nextInvoiceNumber(): Promise<number> {
  const last = await prisma.invoice.findFirst({
    orderBy: { number: "desc" },
    select: { number: true },
  });
  return (last?.number ?? 1000) + 1;
}

export function formatInvoiceNo(n: number): string {
  return `INV-${String(n).padStart(4, "0")}`;
}

/** Coerce the JSON lineItems column into a typed array. */
export function asLineItems(value: unknown): LineItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((x) => ({
      description: String((x as { description?: unknown }).description ?? ""),
      amountPence: Number((x as { amountPence?: unknown }).amountPence ?? 0) || 0,
    }))
    .filter((x) => x.description.trim() !== "");
}
