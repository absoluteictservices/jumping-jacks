// Money helpers. Prices are stored as integer pence everywhere.

export function formatGBP(pence: number | null | undefined): string {
  if (pence == null) return "Call to book";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: pence % 100 === 0 ? 0 : 2,
  }).format(pence / 100);
}

/** Parse a "£80" or "80" or "80.00" string into pence. Returns null if blank. */
export function parsePoundsToPence(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "").trim();
  if (cleaned === "") return null;
  const pounds = Number(cleaned);
  if (!Number.isFinite(pounds) || pounds < 0) return null;
  return Math.round(pounds * 100);
}
