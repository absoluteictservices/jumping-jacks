// Date utilities. We represent a "hire day" as a calendar date key in the form
// "YYYY-MM-DD". All availability logic operates on these keys to avoid timezone
// drift. The business operates in the UK, so "today" is computed in Europe/London.

export type DateKey = string; // "YYYY-MM-DD"

const LONDON_TZ = "Europe/London";

/** Format a Date as a YYYY-MM-DD key in a given IANA timezone (default Europe/London). */
export function toDateKey(date: Date, timeZone: string = LONDON_TZ): DateKey {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA yields YYYY-MM-DD
  return fmt.format(date);
}

/** Today's date key in Europe/London. */
export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now, LONDON_TZ);
}

/** Parse a YYYY-MM-DD key into a UTC-midnight Date (safe for DB @db.Date columns). */
export function dateKeyToUTCDate(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Convert a DB Date (stored at UTC midnight) back to a date key. */
export function dbDateToKey(date: Date): DateKey {
  return toDateKey(date, "UTC");
}

/** Add (or subtract) whole days to a date key. */
export function addDays(key: DateKey, days: number): DateKey {
  const base = dateKeyToUTCDate(key);
  base.setUTCDate(base.getUTCDate() + days);
  return toDateKey(base, "UTC");
}

/** Compare two date keys: negative if a<b, 0 if equal, positive if a>b. */
export function compareKeys(a: DateKey, b: DateKey): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Inclusive list of date keys from start to end. */
export function listDateKeys(start: DateKey, end: DateKey): DateKey[] {
  const out: DateKey[] = [];
  let cur = start;
  while (compareKeys(cur, end) <= 0) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

/** First and last day keys of the month containing `key`. */
export function monthBounds(key: DateKey): { start: DateKey; end: DateKey } {
  const [y, m] = key.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

/** Human-friendly display, e.g. "Sat 4 Jul 2026". */
export function formatDisplay(key: DateKey): string {
  const date = dateKeyToUTCDate(key);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
