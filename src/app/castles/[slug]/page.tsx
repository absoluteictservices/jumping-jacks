import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getInflatableBySlug } from "@/lib/inflatables";
import { CastleImage } from "@/components/CastleImage";
import { BookingWidget } from "@/components/BookingWidget";
import { formatGBP } from "@/lib/money";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = await getInflatableBySlug(params.slug);
  if (!c) return { title: "Castle not found" };
  return {
    title: `${c.name} Hire in Leeds`,
    description: `${c.description.slice(0, 150)} Check availability and book the ${c.name} online for delivery across Leeds.`,
  };
}

export default async function CastleDetailPage({ params }: { params: { slug: string } }) {
  const c = await getInflatableBySlug(params.slug);
  if (!c || !c.active) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: c.name,
    description: c.description,
    category: c.theme ?? "Bouncy castle",
    ...(c.pricePerDay != null && {
      offers: {
        "@type": "Offer",
        priceCurrency: "GBP",
        price: (c.pricePerDay / 100).toFixed(2),
        availability: "https://schema.org/InStock",
        url: `${SITE.url}/castles/${c.slug}`,
      },
    }),
  };

  return (
    <div className="container-x py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <nav className="mb-6 text-sm text-brand-ink/50">
        <Link href="/castles" className="hover:text-brand-purple">Bouncy castles</Link> / <span>{c.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery + info */}
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-4xl">
            <CastleImage name={c.name} images={c.images} index={c.sortOrder} priority />
          </div>
          {c.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {c.images.slice(1, 5).map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-2xl">
                  <CastleImage name={c.name} images={[src]} index={i} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              {c.theme && <span className="chip">{c.theme}</span>}
              {c.ageSuitability && <span className="chip">{c.ageSuitability}</span>}
              {c.dimensions && <span className="chip">{c.dimensions}</span>}
            </div>
            <h1 className="mt-4 text-4xl">{c.name}</h1>
            <p className="mt-2 font-display text-2xl font-extrabold text-brand-purple">
              {formatGBP(c.pricePerDay)}{c.pricePerDay != null && <span className="text-base font-bold text-brand-ink/50"> / day</span>}
            </p>
            <p className="mt-4 text-brand-ink/80">{c.description}</p>

            <ul className="mt-6 space-y-2 text-sm text-brand-ink/70">
              <li>✓ Delivered, set up and collected — full day hire</li>
              <li>✓ Cleaned and safety-checked before every party</li>
              <li>✓ Covers {SITE.areaServed}</li>
            </ul>
          </div>
        </div>

        {/* Booking */}
        <div>
          <div className="lg:sticky lg:top-20">
            <h2 className="mb-3 text-2xl">Check availability & book</h2>
            <BookingWidget inflatableId={c.id} name={c.name} pricePerDay={c.pricePerDay} />
          </div>
        </div>
      </div>
    </div>
  );
}
