import { describe, it, expect } from "vitest";
import {
  computeDayAvailability,
  computeRangeAvailability,
  canBook,
  isActiveBooking,
  isPostcodeCovered,
  earliestBookableKey,
  type BookingLike,
} from "./availability";

const NOW = new Date("2026-06-16T10:00:00Z");
const TODAY = "2026-06-16";

const settings = (over: Partial<{ maxDeliveriesPerDay: number; minLeadTimeDays: number }> = {}) => ({
  maxDeliveriesPerDay: 1,
  minLeadTimeDays: 1,
  ...over,
});

const base = (over: Partial<Parameters<typeof computeDayAvailability>[0]> = {}) => ({
  inflatableId: "spiderman",
  date: "2026-07-01",
  bookings: [] as BookingLike[],
  blackoutDates: [] as string[],
  settings: settings(),
  todayKey: TODAY,
  now: NOW,
  ...over,
});

describe("isActiveBooking", () => {
  it("paid bookings are always active", () => {
    expect(isActiveBooking({ inflatableId: "a", date: "2026-07-01", status: "paid" }, NOW)).toBe(true);
  });
  it("cancelled bookings are never active", () => {
    expect(
      isActiveBooking({ inflatableId: "a", date: "2026-07-01", status: "cancelled" }, NOW),
    ).toBe(false);
  });
  it("held booking with future expiry is active", () => {
    expect(
      isActiveBooking(
        { inflatableId: "a", date: "2026-07-01", status: "held", holdExpiresAt: "2026-06-16T10:10:00Z" },
        NOW,
      ),
    ).toBe(true);
  });
  it("held booking with past expiry is NOT active (auto-release)", () => {
    expect(
      isActiveBooking(
        { inflatableId: "a", date: "2026-07-01", status: "held", holdExpiresAt: "2026-06-16T09:50:00Z" },
        NOW,
      ),
    ).toBe(false);
  });
});

describe("lead time", () => {
  it("earliestBookableKey adds lead days to today", () => {
    expect(earliestBookableKey("2026-06-16", 1)).toBe("2026-06-17");
    expect(earliestBookableKey("2026-06-16", 0)).toBe("2026-06-16");
    expect(earliestBookableKey("2026-06-30", 2)).toBe("2026-07-02");
  });
  it("blocks same-day with default lead time of 1", () => {
    const r = computeDayAvailability(base({ date: TODAY }));
    expect(r.available).toBe(false);
    expect(r.reason).toBe("lead-time");
  });
  it("allows tomorrow with lead time of 1", () => {
    const r = computeDayAvailability(base({ date: "2026-06-17" }));
    expect(r.available).toBe(true);
  });
  it("respects a larger configured lead time", () => {
    const r = computeDayAvailability(
      base({ date: "2026-06-18", settings: settings({ minLeadTimeDays: 3 }) }),
    );
    expect(r.available).toBe(false);
    expect(r.reason).toBe("lead-time");
  });
});

describe("blackout dates", () => {
  it("blocks a blacked-out date for all inflatables", () => {
    const r = computeDayAvailability(base({ date: "2026-07-01", blackoutDates: ["2026-07-01"] }));
    expect(r.available).toBe(false);
    expect(r.reason).toBe("blackout");
  });
});

describe("per-castle availability", () => {
  it("blocks the same castle when it already has an active booking", () => {
    const r = computeDayAvailability(
      base({
        bookings: [{ inflatableId: "spiderman", date: "2026-07-01", status: "paid" }],
      }),
    );
    expect(r.available).toBe(false);
    expect(r.reason).toBe("castle-booked");
  });

  it("a cancelled booking frees the castle", () => {
    const r = computeDayAvailability(
      base({
        bookings: [{ inflatableId: "spiderman", date: "2026-07-01", status: "cancelled" }],
      }),
    );
    expect(r.available).toBe(true);
  });

  it("an expired hold frees the castle", () => {
    const r = computeDayAvailability(
      base({
        bookings: [
          {
            inflatableId: "spiderman",
            date: "2026-07-01",
            status: "held",
            holdExpiresAt: "2026-06-16T09:00:00Z",
          },
        ],
      }),
    );
    expect(r.available).toBe(true);
  });
});

describe("daily delivery cap (one van)", () => {
  it("with cap=1, a date with one OTHER castle booked is unavailable for all", () => {
    const r = computeDayAvailability(
      base({
        inflatableId: "frozen",
        bookings: [{ inflatableId: "spiderman", date: "2026-07-01", status: "paid" }],
      }),
    );
    expect(r.available).toBe(false);
    expect(r.reason).toBe("daily-cap");
  });

  it("with cap=2, two different castles can both be booked on the same date", () => {
    const bookings: BookingLike[] = [
      { inflatableId: "spiderman", date: "2026-07-01", status: "paid" },
    ];
    const r = computeDayAvailability(
      base({ inflatableId: "frozen", bookings, settings: settings({ maxDeliveriesPerDay: 2 }) }),
    );
    expect(r.available).toBe(true);
  });

  it("with cap=2, a third booking is blocked by the cap", () => {
    const bookings: BookingLike[] = [
      { inflatableId: "spiderman", date: "2026-07-01", status: "paid" },
      { inflatableId: "frozen", date: "2026-07-01", status: "paid" },
    ];
    const r = computeDayAvailability(
      base({ inflatableId: "peppa", bookings, settings: settings({ maxDeliveriesPerDay: 2 }) }),
    );
    expect(r.available).toBe(false);
    expect(r.reason).toBe("daily-cap");
  });

  it("expired holds do not count toward the cap", () => {
    const bookings: BookingLike[] = [
      {
        inflatableId: "spiderman",
        date: "2026-07-01",
        status: "held",
        holdExpiresAt: "2026-06-16T09:00:00Z",
      },
    ];
    const r = computeDayAvailability(base({ inflatableId: "frozen", bookings }));
    expect(r.available).toBe(true);
  });
});

describe("rule precedence", () => {
  it("lead-time is reported before blackout", () => {
    const r = computeDayAvailability(base({ date: TODAY, blackoutDates: [TODAY] }));
    expect(r.reason).toBe("lead-time");
  });
  it("castle-booked is reported before daily-cap for the same castle", () => {
    const r = computeDayAvailability(
      base({
        bookings: [
          { inflatableId: "spiderman", date: "2026-07-01", status: "paid" },
          { inflatableId: "frozen", date: "2026-07-01", status: "paid" },
        ],
        settings: settings({ maxDeliveriesPerDay: 5 }),
      }),
    );
    expect(r.reason).toBe("castle-booked");
  });
});

describe("canBook (server gate)", () => {
  it("returns ok for a free slot", () => {
    expect(canBook(base()).ok).toBe(true);
  });
  it("returns not-ok with reason for a taken slot", () => {
    const res = canBook(
      base({ bookings: [{ inflatableId: "spiderman", date: "2026-07-01", status: "held", holdExpiresAt: "2026-06-16T10:10:00Z" }] }),
    );
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("castle-booked");
  });
});

describe("range availability", () => {
  it("computes a full month and disables booked/blackout/lead dates", () => {
    const days = computeRangeAvailability({
      inflatableId: "spiderman",
      start: "2026-06-14",
      end: "2026-06-20",
      bookings: [{ inflatableId: "spiderman", date: "2026-06-18", status: "paid" }],
      blackoutDates: ["2026-06-19"],
      settings: settings(),
      todayKey: TODAY,
      now: NOW,
    });
    const map = Object.fromEntries(days.map((d) => [d.date, d]));
    expect(map["2026-06-14"].available).toBe(false); // before today
    expect(map["2026-06-14"].reason).toBe("lead-time");
    expect(map["2026-06-16"].reason).toBe("lead-time"); // today blocked
    expect(map["2026-06-17"].available).toBe(true);
    expect(map["2026-06-18"].reason).toBe("castle-booked");
    expect(map["2026-06-19"].reason).toBe("blackout");
    expect(map["2026-06-20"].available).toBe(true);
  });
});

describe("postcode coverage", () => {
  it("accepts anything when no prefixes set", () => {
    expect(isPostcodeCovered("M1 1AA", [])).toBe(true);
  });
  it("accepts a matching LS postcode", () => {
    expect(isPostcodeCovered("LS1 4DY", ["LS"])).toBe(true);
    expect(isPostcodeCovered("ls28 7ab", ["LS"])).toBe(true);
  });
  it("rejects a non-covered postcode", () => {
    expect(isPostcodeCovered("M1 1AA", ["LS"])).toBe(false);
  });
});

// ── Definition-of-done scenarios ────────────────────────────────────────────
describe("definition of done", () => {
  it("the same inflatable cannot be booked twice for the same date", () => {
    const existing: BookingLike[] = [
      { inflatableId: "spiderman", date: "2026-07-04", status: "paid" },
    ];
    const second = canBook(base({ date: "2026-07-04", bookings: existing }));
    expect(second.ok).toBe(false);
  });

  it("with cap=1 a date with one booking is unavailable for ALL inflatables", () => {
    const existing: BookingLike[] = [
      { inflatableId: "spiderman", date: "2026-07-04", status: "paid" },
    ];
    for (const id of ["frozen", "peppa", "disco", "slide"]) {
      const r = canBook(base({ inflatableId: id, date: "2026-07-04", bookings: existing }));
      expect(r.ok).toBe(false);
      expect(r.reason).toBe("daily-cap");
    }
  });

  it("two simultaneous checkouts for the same slot: second sees the first's hold and is blocked", () => {
    // First checkout creates a hold expiring 15 min out.
    const firstHold: BookingLike = {
      inflatableId: "spiderman",
      date: "2026-07-04",
      status: "held",
      holdExpiresAt: "2026-06-16T10:15:00Z",
    };
    const secondAttempt = canBook(base({ date: "2026-07-04", bookings: [firstHold] }));
    expect(secondAttempt.ok).toBe(false);
    expect(secondAttempt.reason).toBe("castle-booked");
  });
});
