import { Resend } from "resend";
import { formatGBP } from "./money";
import { formatDisplay, type DateKey } from "./dates";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? "Jumping Jacks Leeds <bookings@jumpingjacksleeds.co.uk>";
const OWNER = process.env.OWNER_EMAIL ?? "info@jumpingjacksleeds.co.uk";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jumpingjacksleeds.co.uk";
const LOGO = `${SITE_URL}/logo.png`;
const PHONE_DISPLAY = "07769 781666";

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
    await resend.emails.send({ from: FROM, replyTo: OWNER, ...args });
  } catch (e) {
    console.error("Email send failed:", e);
  }
}

// Email-client-safe shell: centred 600px card, logo header, brand footer.
const shell = (preheader: string, inner: string) => `
<div style="margin:0;padding:0;background:#f3f0fb;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f3f0fb;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0fb;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(31,17,71,.12);">
        <tr><td style="background:#6C4AB6;padding:28px 24px;text-align:center;">
          <img src="${LOGO}" width="76" alt="Jumping Jacks Leeds" style="display:block;margin:0 auto 10px;height:auto;border:0;border-radius:12px;" />
          <div style="color:#ffffff;font-size:20px;font-weight:bold;">Jumping Jacks Leeds</div>
          <div style="color:#ffffff;opacity:.85;font-size:13px;margin-top:2px;">Fun Bouncy Castle Hire in Leeds</div>
        </td></tr>
        <tr><td style="padding:28px 28px 8px;color:#1F1147;font-size:15px;line-height:1.6;">
          ${inner}
        </td></tr>
        <tr><td style="background:#1F1147;padding:18px 24px;text-align:center;color:#ffffff;opacity:.9;font-size:12px;">
          Jumping Jacks Leeds &nbsp;·&nbsp; <a href="tel:07769781666" style="color:#FFD23F;text-decoration:none;">${PHONE_DISPLAY}</a> &nbsp;·&nbsp; <a href="${SITE_URL}" style="color:#FFD23F;text-decoration:none;">jumpingjacksleeds.co.uk</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</div>`;

const detailsCard = (rows: [string, string][]) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5fd;border-radius:14px;margin:16px 0;">
    <tr><td style="padding:6px 18px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;">
        ${rows
          .map(
            ([k, v], i) =>
              `<tr>
                 <td style="padding:10px 0;color:#6b6b80;${i ? "border-top:1px solid #ece8f6;" : ""}">${k}</td>
                 <td style="padding:10px 0;text-align:right;font-weight:bold;${i ? "border-top:1px solid #ece8f6;" : ""}">${v}</td>
               </tr>`,
          )
          .join("")}
      </table>
    </td></tr>
  </table>`;

function bookingRows(d: BookingEmailData): [string, string][] {
  const rows: [string, string][] = [
    ["Inflatable", d.inflatableName],
    ["Date", formatDisplay(d.date)],
  ];
  if (d.deliveryTime) rows.push(["Preferred time", d.deliveryTime]);
  rows.push(["Delivery to", `${d.deliveryAddress}, ${d.deliveryPostcode}`]);
  rows.push(["Total paid", formatGBP(d.totalPence)]);
  rows.push(["Booking ref", d.bookingId.slice(-8).toUpperCase()]);
  return rows;
}

export async function sendCustomerConfirmation(d: BookingEmailData) {
  await send({
    to: d.email,
    subject: `Booking confirmed 🎉 — ${d.inflatableName} on ${formatDisplay(d.date)}`,
    html: shell(
      `Your ${d.inflatableName} hire on ${formatDisplay(d.date)} is confirmed.`,
      `
      <div style="text-align:center;margin-bottom:8px;">
        <div style="font-size:34px;line-height:1;">🎉</div>
        <h1 style="margin:8px 0 0;font-size:22px;color:#1F1147;">You're all booked!</h1>
      </div>
      <p>Hi ${d.customerName},</p>
      <p>Thanks for booking with Jumping Jacks — your bouncy castle hire is <strong>confirmed and paid in full</strong>.</p>
      ${detailsCard(bookingRows(d))}
      <p>We'll deliver and set up in the morning and collect in the evening, and we'll be in touch the day before to confirm a delivery window.</p>
      <p>Any questions? Just reply to this email or call us on <a href="tel:07769781666" style="color:#6C4AB6;font-weight:bold;text-decoration:none;">${PHONE_DISPLAY}</a>.</p>
      <p style="margin-top:18px;">See you soon,<br/><strong>The Jumping Jacks team</strong></p>
    `,
    ),
  });
}

export async function sendOwnerNotification(d: BookingEmailData) {
  await send({
    to: OWNER,
    subject: `💰 New booking: ${d.inflatableName} — ${formatDisplay(d.date)}`,
    html: shell(
      `New paid booking from ${d.customerName}.`,
      `
      <h1 style="margin:0 0 4px;font-size:20px;color:#1F1147;">New paid booking</h1>
      <p style="margin-top:0;color:#6b6b80;">A customer has booked and paid online.</p>
      ${detailsCard([
        ...bookingRows(d),
        ["Customer", d.customerName],
        ["Phone", d.phone],
        ["Email", d.email],
      ])}
      <p style="text-align:center;">
        <a href="${SITE_URL}/admin/bookings" style="display:inline-block;background:#FF5DA2;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px;">View in admin</a>
      </p>
    `,
    ),
  });
}

export async function sendContactMessage(args: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const safeMsg = args.message.replace(/</g, "&lt;");
  await send({
    to: OWNER,
    subject: `✉️ Website enquiry from ${args.name}`,
    html: shell(
      `New website enquiry from ${args.name}.`,
      `
      <h1 style="margin:0 0 12px;font-size:20px;color:#1F1147;">New website enquiry</h1>
      ${detailsCard([
        ["Name", args.name],
        ["Email", args.email],
        ...(args.phone ? ([["Phone", args.phone]] as [string, string][]) : []),
      ])}
      <p style="color:#6b6b80;margin-bottom:4px;">Message</p>
      <div style="background:#f7f5fd;border-radius:14px;padding:16px 18px;white-space:pre-wrap;">${safeMsg}</div>
    `,
    ),
  });
}
