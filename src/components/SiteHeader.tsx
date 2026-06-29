"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE, NAV_LINKS } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE.name} home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Jumping Jacks Leeds — bouncy castle hire" className="h-11 w-auto" />
          <span className="font-display text-lg font-extrabold leading-none text-brand-purple">
            Jumping Jacks<span className="block text-[11px] font-bold text-brand-ink/50">Leeds</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="font-bold text-brand-ink/80 hover:text-brand-purple">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a href={`tel:${SITE.phone}`} className="font-bold text-brand-purple" aria-label={`Call ${SITE.phoneDisplay}`}>
            {SITE.phoneDisplay}
          </a>
          <Link href="/castles" className="btn-primary !px-5 !py-2.5 text-sm">
            Book Now
          </Link>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-xl ring-1 ring-black/10 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-white md:hidden">
          <nav className="container-x flex flex-col py-3" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-xl px-2 py-3 font-bold text-brand-ink/80 hover:bg-brand-violet/5"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-3">
              <a href={`tel:${SITE.phone}`} className="btn-secondary flex-1 text-sm">
                Call us
              </a>
              <Link href="/castles" className="btn-primary flex-1 text-sm" onClick={() => setOpen(false)}>
                Book Now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
