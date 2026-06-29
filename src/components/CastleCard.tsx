import Link from "next/link";
import { CastleImage } from "./CastleImage";
import { formatGBP } from "@/lib/money";

export interface CastleCardData {
  name: string;
  slug: string;
  theme: string | null;
  ageSuitability: string | null;
  pricePerDay: number | null;
  images: string[];
}

export function CastleCard({ castle, index = 0 }: { castle: CastleCardData; index?: number }) {
  return (
    <div className="card group flex flex-col overflow-hidden">
      <Link href={`/castles/${castle.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <CastleImage
          name={castle.name}
          images={castle.images}
          index={index}
          className="transition duration-300 group-hover:scale-105"
          priority={index < 2}
        />
        {castle.theme && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-brand-purple">
            {castle.theme}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-extrabold text-brand-ink">{castle.name}</h3>
        {castle.ageSuitability && (
          <p className="mt-1 text-sm text-brand-ink/60">{castle.ageSuitability}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg font-extrabold text-brand-purple">
            {formatGBP(castle.pricePerDay)}
            {castle.pricePerDay != null && <span className="text-sm font-bold text-brand-ink/50"> /day</span>}
          </span>
        </div>
        <Link
          href={`/castles/${castle.slug}`}
          className="btn-primary mt-4 w-full text-sm"
        >
          Check availability
        </Link>
      </div>
    </div>
  );
}
