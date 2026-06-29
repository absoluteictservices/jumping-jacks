import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe, SITE_URL } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { createHold } from "@/lib/availability.server";
import { formatDisplay } from "@/lib/dates";

export const dynamic = "force-dynamic";

const Schema = z.object({
  inflatableId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  customerName: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(5).max(40),
  deliveryAddress: z.string().min(3).max(300),
  deliveryPostcode: z.string().min(3).max(12),
  deliveryTime: z.string().max(60).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
  }
  const d = parsed.data;

  // 1. Re-validate availability + create a hold (race-safe, server-side).
  const hold = await createHold({
    inflatableId: d.inflatableId,
    date: d.date,
    customerName: d.customerName,
    email: d.email,
    phone: d.phone,
    deliveryAddress: d.deliveryAddress,
    deliveryPostcode: d.deliveryPostcode,
    deliveryTime: d.deliveryTime ?? undefined,
    notes: d.notes ?? undefined,
  });

  if (!hold.ok) {
    return NextResponse.json({ error: hold.error }, { status: 409 });
  }

  // 2. Create the Stripe Checkout session for the FULL price.
  const inflatable = await prisma.inflatable.findUnique({ where: { id: d.inflatableId } });
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: d.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: hold.totalPence,
            product_data: {
              name: `${inflatable?.name ?? "Bouncy castle"} hire`,
              description: `Full day hire on ${formatDisplay(d.date)} — delivered to ${d.deliveryPostcode}`,
            },
          },
        },
      ],
      metadata: { bookingId: hold.bookingId },
      payment_intent_data: { metadata: { bookingId: hold.bookingId } },
      success_url: `${SITE_URL}/booking/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/castles/${inflatable?.slug ?? ""}?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
    });

    await prisma.booking.update({
      where: { id: hold.bookingId },
      data: { stripeCheckoutId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe session error", e);
    // Release the hold so the slot frees up immediately.
    await prisma.booking.update({
      where: { id: hold.bookingId },
      data: { status: "cancelled" },
    }).catch(() => {});
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 500 });
  }
}
