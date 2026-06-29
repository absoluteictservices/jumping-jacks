import type { Metadata } from "next";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { formatGBP } from "@/lib/money";
import { formatDisplay, dbDateToKey } from "@/lib/dates";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  robots: { index: false, follow: false },
};

export default async function ConfirmedPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams.session_id;
  let booking: Awaited<ReturnType<typeof loadBooking>> = null;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const bookingId = session.metadata?.bookingId;
      if (bookingId) booking = await loadBooking(bookingId);
    } catch (e) {
      console.error("confirmation lookup failed", e);
    }
  }

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-green/20 text-3xl">🎉</div>
        <h1 className="mt-4 text-4xl">You're all booked!</h1>
        <p className="mt-3 text-lg text-brand-ink/70">
          Thanks for booking with Jumping Jacks. A confirmation email is on its way to you.
        </p>

        {booking ? (
          <div className="card mt-8 p-6 text-left">
            <Row label="Inflatable" value={booking.inflatableName} />
            <Row label="Date" value={formatDisplay(booking.date)} />
            {booking.deliveryTime && <Row label="Preferred time" value={booking.deliveryTime} />}
            <Row label="Delivery to" value={`${booking.deliveryAddress}, ${booking.deliveryPostcode}`} />
            <Row label="Total paid" value={formatGBP(booking.totalPence)} />
            <Row label="Booking ref" value={booking.ref} />
            <div className="mt-4 rounded-xl bg-brand-violet/5 p-3 text-sm text-brand-ink/70">
              {booking.status === "paid"
                ? "Payment received and your date is confirmed. We'll be in touch the day before to arrange delivery."
                : "We're just finalising your payment confirmation — your email will arrive shortly. If anything looks off, call us."}
            </div>
          </div>
        ) : (
          <div className="card mt-8 p-6 text-brand-ink/70">
            <p>Your payment is being processed. You'll receive a confirmation email shortly.</p>
            <p className="mt-2 text-sm">Any questions? Call us on <a href={`tel:${SITE.phone}`} className="font-bold text-brand-purple">{SITE.phoneDisplay}</a>.</p>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-secondary">Back to home</Link>
          <Link href="/castles" className="btn-primary">Book another</Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 py-2 last:border-0">
      <span className="text-sm text-brand-ink/50">{label}</span>
      <span className="text-right font-bold text-brand-ink">{value}</span>
    </div>
  );
}

async function loadBooking(bookingId: string) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { inflatable: true } });
  if (!b) return null;
  return {
    inflatableName: b.inflatable.name,
    date: dbDateToKey(b.date),
    deliveryAddress: b.deliveryAddress,
    deliveryPostcode: b.deliveryPostcode,
    deliveryTime: b.deliveryTime,
    totalPence: b.totalPence,
    status: b.status,
    ref: b.id.slice(-8).toUpperCase(),
  };
}
