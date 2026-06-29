// ─────────────────────────────────────────────────────────────────────────
// AVAILABILITY ENGINE
//
// This is the part the old site got wrong, so it is implemented as a set of
// PURE functions (no DB, no clock) that are exhaustively unit-tested. The DB
// layer (availability.server.ts) loads rows and feeds them in.
//
// Rules:
//  1. Per-castle: an inflatable (qty 1) is unavailable on date D if an ACTIVE
//     booking (paid, or a non-expired hold) exists for that inflatable on D.
//  2. Daily delivery cap ("one van"): if the count of ACTIVE bookings on D
//     across ALL inflatables reaches settings.maxDeliveriesPerDay, D is
//     unavailable for every inflatable, regardless of remaining stock.
//  3. Blackout dates: D is unavailable for everything.
//  4. Lead time: D is unavailable if D < today + minLeadTimeDays.
//  5. Holds: a held booking only counts while holdExpiresAt is in the future.
//     Cancelled bookings never count.
// ─────────────────────────────────────────────────────────────────────────

import { addDays, compareKeys, listDateKeys, type DateKey } from "./dates";

export type BookingStatus = "held" | "paid" | "cancelled";

export interface BookingLike {
  inflatableId: string;
  date: DateKey;
  status: BookingStatus;
  /** ISO timestamp string or Date; null/undefined means "no expiry" (treated active). */
  holdExpiresAt?: string | Date | null;
}

export interface AvailabilitySettings {
  maxDeliveriesPerDay: number;
  minLeadTimeDays: number;
}

export type UnavailableReason =
  | "blackout"
  | "lead-time"
  | "castle-booked"
  | "daily-cap";

export interface DayAvailability {
  date: DateKey;
  available: boolean;
  reason?: UnavailableReason;
}

/** Is this booking currently occupying its slot? */
export function isActiveBooking(b: BookingLike, now: Date): boolean {
  if (b.status === "cancelled") return false;
  if (b.status === "paid") return true;
  // held: active only if not yet expired
  if (b.holdExpiresAt == null) return true;
  const exp = b.holdExpiresAt instanceof Date ? b.holdExpiresAt : new Date(b.holdExpiresAt);
  return exp.getTime() > now.getTime();
}

/** Earliest bookable date key given lead time. */
export function earliestBookableKey(todayKey: DateKey, minLeadTimeDays: number): DateKey {
  return addDays(todayKey, Math.max(0, minLeadTimeDays));
}

export interface DayInput {
  inflatableId: string;
  date: DateKey;
  bookings: BookingLike[];
  blackoutDates: Set<string> | string[];
  settings: AvailabilitySettings;
  todayKey: DateKey;
  now: Date;
}

/** Compute availability of a single inflatable on a single date. */
export function computeDayAvailability(input: DayInput): DayAvailability {
  const { inflatableId, date, settings, todayKey, now } = input;
  const blackout =
    input.blackoutDates instanceof Set
      ? input.blackoutDates
      : new Set(input.blackoutDates);

  // 4. Lead time
  const earliest = earliestBookableKey(todayKey, settings.minLeadTimeDays);
  if (compareKeys(date, earliest) < 0) {
    return { date, available: false, reason: "lead-time" };
  }

  // 3. Blackout
  if (blackout.has(date)) {
    return { date, available: false, reason: "blackout" };
  }

  const activeOnDate = input.bookings.filter(
    (b) => b.date === date && isActiveBooking(b, now),
  );

  // 1. Per-castle: is THIS inflatable already taken on this date?
  if (activeOnDate.some((b) => b.inflatableId === inflatableId)) {
    return { date, available: false, reason: "castle-booked" };
  }

  // 2. Daily delivery cap across all inflatables
  if (activeOnDate.length >= Math.max(1, settings.maxDeliveriesPerDay)) {
    return { date, available: false, reason: "daily-cap" };
  }

  return { date, available: true };
}

export interface RangeInput {
  inflatableId: string;
  start: DateKey;
  end: DateKey;
  bookings: BookingLike[];
  blackoutDates: Set<string> | string[];
  settings: AvailabilitySettings;
  todayKey: DateKey;
  now: Date;
}

/** Compute availability for every date in an inclusive range. */
export function computeRangeAvailability(input: RangeInput): DayAvailability[] {
  const blackout =
    input.blackoutDates instanceof Set
      ? input.blackoutDates
      : new Set(input.blackoutDates);
  return listDateKeys(input.start, input.end).map((date) =>
    computeDayAvailability({
      inflatableId: input.inflatableId,
      date,
      bookings: input.bookings,
      blackoutDates: blackout,
      settings: input.settings,
      todayKey: input.todayKey,
      now: input.now,
    }),
  );
}

/**
 * Final server-side gate before creating a hold or confirming a webhook.
 * Returns ok=false with a reason if the slot cannot be taken. This is the
 * single source of truth used both at checkout-session creation and in the
 * webhook (re-validated against fresh DB state each time).
 */
export function canBook(input: DayInput): { ok: boolean; reason?: UnavailableReason } {
  const result = computeDayAvailability(input);
  return result.available ? { ok: true } : { ok: false, reason: result.reason };
}

/** Postcode coverage check. Empty prefix list = accept anything. */
export function isPostcodeCovered(postcode: string, prefixes: string[]): boolean {
  if (!prefixes || prefixes.length === 0) return true;
  const normalized = postcode.toUpperCase().replace(/\s+/g, "");
  return prefixes.some((p) => normalized.startsWith(p.toUpperCase().replace(/\s+/g, "")));
}
