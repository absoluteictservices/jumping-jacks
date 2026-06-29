import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { confirmBooking } from "@/lib/availability.server";
import { sendCustomerConfirmation, sendOwnerNotification } from "@/lib/email";
import { dbDateToKey } from "@/lib/dates";

export const dynamic = "force-dynamic";
// Stripe needs the raw body; ensure this runs on the Node runtime.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? "";

      if (bookingId && session.payment_status === "paid") {
        const result = await confirmBooking(bookingId, paymentIntentId);
        if (result.ok && !result.alreadyPaid) {
          await notify(bookingId);
        }
      }
    }
  } catch (e) {
    // Log but still 200 so Stripe doesn't hammer retries on our own bugs;
    // the booking row is the source of truth and can be reconciled in admin.
    console.error("Webhook handler error:", e);
  }

  return NextResponse.json({ received: true });
}

async function notify(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { inflatable: true },
  });
  if (!booking) return;
  const data = {
    customerName: booking.customerName,
    email: booking.email,
    phone: booking.phone,
    inflatableName: booking.inflatable.name,
    date: dbDateToKey(booking.date),
    deliveryAddress: booking.deliveryAddress,
    deliveryPostcode: booking.deliveryPostcode,
    deliveryTime: booking.deliveryTime,
    totalPence: booking.totalPence,
    bookingId: booking.id,
  };
  await Promise.allSettled([sendCustomerConfirmation(data), sendOwnerNotification(data)]);
}
