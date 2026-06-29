import { Resend } from "resend";
import { formatGBP } from "./money";
import { formatDisplay, type DateKey } from "./dates";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? "Jumping Jacks Leeds <bookings@jumpingjacksleeds.co.uk>";
const OWNER = process.env.OWNER_EMAIL ?? "info@jumpingjacksleeds.co.uk";

export interface BookingEmailData {
  customerName: string;
  email: string;
  phone: string;
  inflatableName: string;
  date: DateKey;
  deliveryAddress: string;
  deliveryPostcode: string;
  deliveryTime?: string | null;
  totalPence: number;
  bookingId: string;
}

async function send(args: { to: string | string[]; subject: string; html: string }) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email:", args.subject);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, ...args });
  } catch (e) {
    console.error("Email send failed:", e);
  }
}

const wrap = (inner: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1F1147">
    <div style="background:#6C4AB6;color:#fff;padding:20px 24px;border-radius:16px 16px 0 0">
      <h1 style="margin:0;font-size:20px">Jumping Jacks Leeds</h1>
      <p style="margin:4px 0 0;opacity:.9">Fun Bouncy Castle Hire in Leeds</p>
    </div>
    <div style="border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 16px 16px">
      ${inner}
    </div>
  </div>`;

const details = (d: BookingEmailData) => `
  <table style="width:100%;border-collapse:collapse;font-size:15px">
    <tr><td style="padding:6px 0;color:#666">Inflatable</td><td style="padding:6px 0;text-align:right"><strong>${d.inflatableName}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#666">Date</td><td style="padding:6px 0;text-align:right"><strong>${formatDisplay(d.date)}</strong></td></tr>
    ${d.deliveryTime ? `<tr><td style="padding:6px 0;color:#666">Preferred time</td><td style="padding:6px 0;text-align:right">${d.deliveryTime}</td></tr>` : ""}
    <tr><td style="padding:6px 0;color:#666">Delivery to</td><td style="padding:6px 0;text-align:right">${d.deliveryAddress}, ${d.deliveryPostcode}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Total paid</td><td style="padding:6px 0;text-align:right"><strong>${formatGBP(d.totalPence)}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#666">Booking ref</td><td style="padding:6px 0;text-align:right">${d.bookingId.slice(-8).toUpperCase()}</td></tr>
  </table>`;

export async function sendCustomerConfirmation(d: BookingEmailData) {
  await send({
    to: d.email,
    subject: `Booking confirmed — ${d.inflatableName} on ${formatDisplay(d.date)}`,
    html: wrap(`
      <p>Hi ${d.customerName},</p>
      <p>Thanks for booking with Jumping Jacks! Your bouncy castle hire is <strong>confirmed and paid in full</strong>. 🎉</p>
      ${details(d)}
      <p style="margin-top:20px">We'll deliver and set up in the morning and collect in the evening. We'll be in touch the day before to confirm a delivery window.</p>
      <p>Any questions? Call us on <a href="tel:07769781666">07769 781666</a> or reply to this email.</p>
      <p style="margin-top:20px">See you soon,<br/>The Jumping Jacks team</p>
    `),
  });
}

export async function sendOwnerNotification(d: BookingEmailData) {
  await send({
    to: OWNER,
    subject: `New booking: ${d.inflatableName} — ${formatDisplay(d.date)}`,
    html: wrap(`
      <p><strong>New paid booking received.</strong></p>
      ${details(d)}
      <table style="width:100%;border-collapse:collapse;font-size:15px;margin-top:12px">
        <tr><td style="padding:6px 0;color:#666">Customer</td><td style="padding:6px 0;text-align:right">${d.customerName}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Phone</td><td style="padding:6px 0;text-align:right"><a href="tel:${d.phone}">${d.phone}</a></td></tr>
        <tr><td style="padding:6px 0;color:#666">Email</td><td style="padding:6px 0;text-align:right">${d.email}</td></tr>
      </table>
    `),
  });
}

export async function sendContactMessage(args: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  await send({
    to: OWNER,
    subject: `Website enquiry from ${args.name}`,
    html: wrap(`
      <p><strong>New enquiry from the website contact form.</strong></p>
      <p><strong>Name:</strong> ${args.name}<br/>
      <strong>Email:</strong> ${args.email}<br/>
      ${args.phone ? `<strong>Phone:</strong> ${args.phone}<br/>` : ""}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${args.message.replace(/</g, "&lt;")}</p>
    `),
  });
}
