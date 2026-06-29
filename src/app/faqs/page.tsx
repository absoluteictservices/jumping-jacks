import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs — Bouncy Castle Hire",
  description:
    "Common questions about bouncy castle hire in Leeds: delivery area, setup, weather and wind policy, surface requirements, supervision, payment and cancellations.",
};

const FAQS = [
  {
    q: "Which areas do you cover?",
    a: "We cover the whole of Leeds and the surrounding areas. If you're just outside Leeds, get in touch — we'll always try to help. Our online booking checks your postcode at checkout.",
  },
  {
    q: "Do you deliver and set up?",
    a: "Yes! Hire is for the full day. We deliver and set up in the morning and return to collect in the evening. We'll confirm a delivery window the day before your booking.",
  },
  {
    q: "What surfaces can the bouncy castle go on?",
    a: "Grass is ideal as we anchor the castle securely with stakes. We can also set up on hard standing (patios, indoor halls) using sandbags — just let us know the surface in your booking notes so we bring the right kit.",
  },
  {
    q: "How much space do I need?",
    a: "You'll need the footprint of the castle plus around 3–4 feet of clearance all around, plus access to get it through to your garden. Each castle's dimensions are listed on its page. We need flat, accessible ground free of sharp objects and animal mess.",
  },
  {
    q: "What's your weather and wind policy?",
    a: "Safety comes first. Bouncy castles cannot be used safely in high winds (gusts above roughly 24mph) or heavy rain. If the forecast is dangerous, we'll contact you to reschedule for free or arrange a full refund. Light showers are usually fine as our castles have rain covers.",
  },
  {
    q: "Does the bouncy castle need to be supervised?",
    a: "Yes. A responsible adult must supervise children on the inflatable at all times. We provide safety guidance on delivery, including age and capacity limits. Please no shoes, food, drinks or sharp objects on the castle.",
  },
  {
    q: "Is there a power supply needed?",
    a: "The blower needs a standard mains socket within about 25 metres. If you don't have access to power, we can discuss a generator — just ask.",
  },
  {
    q: "How do I pay?",
    a: "Booking is online and you pay the full amount securely by card via Stripe at the time of booking. Your date is confirmed instantly and you'll receive a confirmation email.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Cancel or reschedule free of charge with 48 hours' notice or more. Within 48 hours of your hire date we're unable to offer a refund, as we'll usually have turned other bookings away for that day, but you're welcome to reschedule to another available date. If we ever have to cancel for safety reasons such as dangerous weather, you can reschedule for free or get a full refund.",
  },
];

export default function FaqsPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="container-x py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl">Frequently asked questions</h1>
        <p className="mt-3 text-lg text-brand-ink/70">
          Everything you need to know about hiring a bouncy castle from Jumping Jacks. Still stuck? Call us on{" "}
          <a href={`tel:${SITE.phone}`} className="font-bold text-brand-purple">{SITE.phoneDisplay}</a>.
        </p>

        <div className="mt-8 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-display text-lg font-extrabold text-brand-ink">
                {f.q}
                <span className="ml-4 text-brand-purple transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-brand-ink/75">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
