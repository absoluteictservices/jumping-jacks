import type { Metadata } from "next";
import Link from "next/link";
import { getActiveInflatables } from "@/lib/inflatables";
import { CastleImage } from "@/components/CastleImage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of our bouncy castles and inflatables for hire in Leeds.",
};

export default async function GalleryPage() {
  const castles = await getActiveInflatables();
  // Build a flat list of images; fall back to one placeholder tile per castle.
  const tiles = castles.flatMap((c, ci) =>
    (c.images.length ? c.images : [null]).map((img, i) => ({
      key: `${c.slug}-${i}`,
      name: c.name,
      images: img ? [img] : [],
      index: ci + i,
    })),
  );

  return (
    <div className="container-x py-12">
      <h1 className="text-4xl">Gallery</h1>
      <p className="mt-3 max-w-2xl text-lg text-brand-ink/70">
        A peek at our colourful, well-kept inflatables. Upload your own photos anytime from the admin panel.
      </p>

      {tiles.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.key} className="relative aspect-square overflow-hidden rounded-3xl">
              <CastleImage name={t.name} images={t.images} index={t.index} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-3xl bg-brand-violet/5 p-8 text-brand-ink/60">Photos will appear here once added.</p>
      )}

      <div className="mt-10">
        <Link href="/castles" className="btn-primary">Browse & book</Link>
      </div>
    </div>
  );
}
