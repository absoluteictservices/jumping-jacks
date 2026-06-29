import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getSettings } from "./settings";
import {
  canBook,
  computeRangeAvailability,
  isPostcodeCovered,
  type BookingLike,
  type DayAvailability,
} from "./availability";
import {
  dbDateToKey,
  dateKeyToUTCDate,
  monthBounds,
  todayKey,
  type DateKey,
} from "./dates";

/** Cancel any held bookings whose hold has expired. Safe to call often. */
export async function releaseExpiredHolds(now: Date = new Date()): Promise<number> {
  const res = await prisma.booking.updateMany({
    where: { status: "held", holdExpiresAt: { lt: now } },
    data: { status: "cancelled" },
  });
  return res.count;
}

/** Load active (held-not-expired / paid) bookings within a date range as BookingLike[]. */
async function loadActiveBookings(start: DateKey, end: DateKey): Promise<BookingLike[]> {
  const rows = await prisma.booking.findMany({
    where: {
      status: { in: ["held", "paid"] },
      date: { gte: dateKeyToUTCDate(start), lte: dateKeyToUTCDate(end) },
    },
    select: { inflatableId: true, date: true, status: true, holdExpiresAt: true },
  });
  return rows.map((r) => ({
    inflatableId: r.inflatableId,
    date: dbDateToKey(r.date),
    status: r.status as BookingLike["status"],
    holdExpiresAt: r.holdExpiresAt,
  }));
}

async function loadBlackouts(start: DateKey, end: DateKey): Promise<string[]> {
  const rows = await prisma.blackoutDate.findMany({
    where: { date: { gte: dateKeyToUTCDate(start), lte: dateKeyToUTCDate(end) } },
    select: { date: true },
  });
  return rows.map((r) => dbDateToKey(r.date));
}

/** Availability for one inflatable across a whole month (for the calendar UI). */
export async function getMonthAvailability(
  inflatableId: string,
  monthKey: DateKey,
  now: Date = new Date(),
): Promise<DayAvailability[]> {
  await releaseExpiredHolds(now);
  const { start, end } = monthBounds(monthKey);
  const [bookings, blackoutDates, settings] = await Promise.all([
    loadActiveBookings(start, end),
    loadBlackouts(start, end),
    getSettings(),
  ]);
  return computeRangeAvailability({
    inflatableId,
    start,
    end,
    bookings,
    blackoutDates,
    settings,
    todayKey: todayKey(now),
    now,
  });
}

export interface CreateHoldInput {
  inflatableId: string;
  date: DateKey;
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  deliveryPostcode: string;
  deliveryTime?: string;
  notes?: string;
}

export type CreateHoldResult =
  | { ok: true; bookingId: string; totalPence: number }
  | { ok: false; error: string; reason?: string };

/**
 * Race-safe hold creation. Runs in a Serializable transaction and is backed by
 * a partial unique index (inflatableId, date) WHERE status IN ('held','paid')
 * so two concurrent buyers can never both take the same castle+date.
 */
export async function createHold(input: CreateHoldInput): Promise<CreateHoldResult> {
  const now = new Date();
  const settings = await getSettings();

  // Validate postcode coverage (cheap, outside the tx).
  if (!isPostcodeCovered(input.deliveryPostcode, settings.deliveryPostcodePrefixes)) {
    return { ok: false, error: "Sorry, that postcode is outside our delivery area." };
  }

  const inflatable = await prisma.inflatable.findUnique({ where: { id: input.inflatableId } });
  if (!inflatable || !inflatable.active) {
    return { ok: false, error: "That inflatable is not available to book." };
  }
  if (inflatable.pricePerDay == null) {
    return { ok: false, error: "This inflatable isn't bookable online yet — please call us." };
  }

  const holdExpiresAt = new Date(now.getTime() + settings.holdMinutes * 60_000);

  const MAX_RETRIES = 3;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          // Release expired holds for this date so they don't block (and don't
          // trip the partial unique index).
          await tx.booking.updateMany({
            where: { status: "held", holdExpiresAt: { lt: now }, date: dateKeyToUTCDate(input.date) },
            data: { status: "cancelled" },
          });

          const rows = await tx.booking.findMany({
            where: { status: { in: ["held", "paid"] }, date: dateKeyToUTCDate(input.date) },
            select: { inflatableId: true, date: true, status: true, holdExpiresAt: true },
          });
          const bookings: BookingLike[] = rows.map((r) => ({
            inflatableId: r.inflatableId,
            date: dbDateToKey(r.date),
            status: r.status as BookingLike["status"],
            holdExpiresAt: r.holdExpiresAt,
          }));

          const gate = canBook({
            inflatableId: input.inflatableId,
            date: input.date,
            bookings,
            blackoutDates: await loadBlackoutsTx(tx, input.date),
            settings,
            todayKey: todayKey(now),
            now,
          });
          if (!gate.ok) {
            return { ok: false as const, error: reasonToMessage(gate.reason), reason: gate.reason };
          }

          const booking = await tx.booking.create({
            data: {
              inflatableId: input.inflatableId,
              date: dateKeyToUTCDate(input.date),
              status: "held",
              customerName: input.customerName,
              email: input.email,
              phone: input.phone,
              deliveryAddress: input.deliveryAddress,
              deliveryPostcode: input.deliveryPostcode,
              deliveryTime: input.deliveryTime,
              notes: input.notes,
              totalPence: inflatable.pricePerDay!,
              holdExpiresAt,
            },
          });
          return { ok: true as const, bookingId: booking.id, totalPence: booking.totalPence };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      return result;
    } catch (e) {
      // Partial unique index violation = someone else grabbed this castle+date.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { ok: false, error: "Sorry, that date was just taken. Please choose another.", reason: "castle-booked" };
      }
      // Serialization failure (40001) — retry a couple of times.
      const msg = (e as Error)?.message ?? "";
      if (msg.includes("could not serialize") || msg.includes("40001")) {
        if (attempt < MAX_RETRIES - 1) continue;
        return { ok: false, error: "That slot is in high demand right now. Please try again." };
      }
      throw e;
    }
  }
  return { ok: false, error: "Could not create booking. Please try again." };
}

async function loadBlackoutsTx(tx: Prisma.TransactionClient, date: DateKey): Promise<string[]> {
  const rows = await tx.blackoutDate.findMany({
    where: { date: dateKeyToUTCDate(date) },
    select: { date: true },
  });
  return rows.map((r) => dbDateToKey(r.date));
}

function reasonToMessage(reason?: string): string {
  switch (reason) {
    case "castle-booked":
      return "Sorry, that inflatable is already booked for that date.";
    case "daily-cap":
      return "Sorry, we're fully booked for deliveries on that date.";
    case "blackout":
      return "Sorry, that date is unavailable.";
    case "lead-time":
      return "Sorry, that date is too soon — please choose a later date.";
    default:
      return "Sorry, that date is unavailable.";
  }
}

/**
 * Confirm a held booking after a successful Stripe payment. Re-validates that
 * the hold is still the valid owner of the slot. Idempotent.
 */
export async function confirmBooking(
  bookingId: string,
  stripePaymentIntentId: string,
): Promise<{ ok: boolean; alreadyPaid?: boolean }> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { ok: false };
  if (booking.status === "paid") return { ok: true, alreadyPaid: true };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "paid", stripePaymentIntentId, holdExpiresAt: null },
  });
  return { ok: true };
}
