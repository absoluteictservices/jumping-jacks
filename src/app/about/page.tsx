import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Jumping Jacks is a family-run bouncy castle hire business based in Leeds with over 13 years' experience. Friendly, safe and reliable inflatable hire.",
};

export default function AboutPage() {
  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl">About Jumping Jacks</h1>
        <div className="mt-6 space-y-4 text-lg text-brand-ink/80">
          <p>
            Jumping Jacks is a friendly, family-focused bouncy castle hire business based right here in Leeds. With over {SITE.yearsExperience} years of experience, we've helped bring the fun to countless birthday parties, school fêtes, christenings and community events across {SITE.areaServed}.
          </p>
          <p>
            We believe hiring a bouncy castle should be simple, safe and stress-free. Every inflatable in our range is cleaned and safety-checked before it arrives, and we handle the delivery, setup and collection for you — so all you have to think about is having a great time.
          </p>
          <p>
            Our mission is straightforward: clean, well-presented inflatables, fair prices, and reliable service you can count on. That's why so many Leeds families come back to us year after year.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { stat: `${SITE.yearsExperience}+`, label: "Years of experience" },
            { stat: "100s", label: "Happy parties" },
            { stat: "All Leeds", label: "Areas covered" },
          ].map((b) => (
            <div key={b.label} className="card p-6 text-center">
              <div className="font-display text-3xl font-extrabold text-brand-purple">{b.stat}</div>
              <div className="mt-1 text-sm text-brand-ink/60">{b.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/castles" className="btn-primary">Browse our castles</Link>
          <Link href="/contact" className="btn-secondary">Get in touch</Link>
        </div>
      </div>
    </div>
  );
}
