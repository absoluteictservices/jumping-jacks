import Link from "next/link";
import { SITE, NAV_LINKS } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-brand-ink text-white/90">
      <div className="container-x grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-display text-xl font-extrabold text-white">Jumping Jacks Leeds</div>
          <p className="mt-2 max-w-xs text-sm text-white/70">{SITE.tagline}. Serving {SITE.areaServed} for over {SITE.yearsExperience} years.</p>
        </div>
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-brand-yellow">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-brand-yellow">Get in touch</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={`tel:${SITE.phone}`} className="hover:text-white">{SITE.phoneDisplay}</a></li>
            <li><a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a></li>
            <li className="text-white/70">{SITE.areaServed}</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-brand-yellow">Ready to bounce?</h3>
          <Link href="/castles" className="btn-sun mt-3 text-sm">Book a castle</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>
            <Link href="/faqs" className="hover:text-white">FAQs</Link> ·{" "}
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
