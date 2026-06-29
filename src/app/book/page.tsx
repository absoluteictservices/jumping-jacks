import type { Metadata } from "next";
import Link from "next/link";
import { getActiveInflatables } from "@/lib/inflatables";
import { BookingWidget } from "@/components/BookingWidget";
import { CastleImage } from "@/components/CastleImage";
import { formatGBP } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a Bouncy Castle",
  description: "Choose your inflatable, pick an available date and book online in minutes.",
};

export default async function BookPage({ searchParams }: { searchParams: { castle?: string } }) {
  const castles = await getActiveInflatables();
  const chosen = searchParams.castle ? castles.find((c) => c.slug === searchParams.castle) : undefined;

  if (chosen) {
    return (
      <div className="container-x py-12">
        <Link href="/book" className="text-sm text-brand-ink/50 hover:text-brand-purple">← Choose a different castle</Link>
        <h1 className="mt-3 text-4xl">Book the {chosen.name}</h1>
        <p className="mt-2 text-brand-ink/70">{formatGBP(chosen.pricePerDay)}{chosen.pricePerDay != null && " / day"}</p>
        <div className="mt-6 max-w-xl">
          <BookingWidget inflatableId={chosen.id} name={chosen.name} pricePerDay={chosen.pricePerDay} />
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <h1 className="text-4xl">Book a bouncy castle</h1>
      <p className="mt-3 text-lg text-brand-ink/70">First, choose your inflatable:</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {castles.map((c, i) => (
          <Link key={c.slug} href={`/book?castle=${c.slug}`} className="card group overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden">
              <CastleImage name={c.name} images={c.images} index={i} className="transition group-hover:scale-105" />
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl font-extrabold">{c.name}</h3>
              <p className="mt-1 font-bold text-brand-purple">{formatGBP(c.pricePerDay)}{c.pricePerDay != null && " / day"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
