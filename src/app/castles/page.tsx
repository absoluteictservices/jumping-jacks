import type { Metadata } from "next";
import Link from "next/link";
import { getActiveInflatables } from "@/lib/inflatables";
import { CastleCard } from "@/components/CastleCard";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bouncy Castles for Hire in Leeds",
  description:
    "Browse our full range of bouncy castles and inflatables for hire in Leeds. Check live availability and book online for delivery across Leeds and surrounding areas.",
};

export default async function CastlesPage() {
  const castles = await getActiveInflatables();
  return (
    <div className="container-x py-12">
      <header className="max-w-2xl">
        <h1 className="text-4xl">Our bouncy castles</h1>
        <p className="mt-3 text-lg text-brand-ink/70">
          Pick your favourite, check the live availability calendar and book online in minutes. We deliver across {SITE.areaServed}.
        </p>
      </header>

      {castles.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {castles.map((c, i) => (
            <CastleCard key={c.slug} castle={c} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl bg-brand-violet/5 p-8 text-center text-brand-ink/70">
          <p>No castles to show yet.</p>
          <p className="mt-2 text-sm">Once the database is connected and seeded, your inflatables appear here. You can manage them in the <Link href="/admin" className="font-bold text-brand-purple underline">admin panel</Link>.</p>
        </div>
      )}
    </div>
  );
}
