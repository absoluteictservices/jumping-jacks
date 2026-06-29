import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Jumping Jacks bouncy castle hire in Leeds. Call, email or send us a message and we'll help you book the perfect inflatable.",
};

export default function ContactPage() {
  return (
    <div className="container-x py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl">Get in touch</h1>
          <p className="mt-3 text-lg text-brand-ink/70">
            Questions about a booking, a special request or just want to check availability? We're happy to help.
          </p>

          <div className="mt-8 space-y-4">
            <a href={`tel:${SITE.phone}`} className="card flex items-center gap-4 p-4 hover:ring-brand-purple/30">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-pink/10 text-2xl">📞</span>
              <span>
                <span className="block text-sm text-brand-ink/50">Call us</span>
                <span className="font-display text-lg font-extrabold text-brand-purple">{SITE.phoneDisplay}</span>
              </span>
            </a>
            <a href={`mailto:${SITE.email}`} className="card flex items-center gap-4 p-4 hover:ring-brand-purple/30">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-sky/10 text-2xl">✉️</span>
              <span>
                <span className="block text-sm text-brand-ink/50">Email us</span>
                <span className="font-display text-lg font-extrabold text-brand-purple">{SITE.email}</span>
              </span>
            </a>
            <div className="card flex items-center gap-4 p-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-green/10 text-2xl">📍</span>
              <span>
                <span className="block text-sm text-brand-ink/50">Coverage</span>
                <span className="font-bold text-brand-ink">{SITE.areaServed}</span>
              </span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-2xl">Send us a message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
