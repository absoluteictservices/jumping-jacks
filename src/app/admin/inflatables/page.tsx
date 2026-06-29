import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatGBP } from "@/lib/money";
import { toggleInflatable, seedCatalogue } from "../actions";
import { MigrateButton, Thumb } from "@/components/admin/ImageTools";

export const dynamic = "force-dynamic";

export default async function AdminInflatables() {
  const inflatables = await prisma.inflatable.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Inflatables</h2>
        <Link href="/admin/inflatables/new" className="btn-primary !py-2 text-sm">+ Add inflatable</Link>
      </div>

      <div className="mt-3 rounded-2xl bg-brand-violet/5 p-4">
        <p className="text-sm text-brand-ink/70">Photos are now hosted on your own site (not WordPress). Click below once to copy your existing photos across — after that, edit any castle to upload new photos directly.</p>
        <div className="mt-2"><MigrateButton /></div>
      </div>

      <div className="mt-4 grid gap-3">
        {inflatables.map((inf) => (
          <div
            key={inf.id}
            className="card flex items-center gap-3 p-3 transition hover:ring-brand-purple/20 sm:gap-4 sm:p-4"
          >
            <Link href={`/admin/inflatables/${inf.id}`} className="shrink-0">
              <Thumb name={inf.name} image={inf.images[0]} index={inf.sortOrder} />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link
                  href={`/admin/inflatables/${inf.id}`}
                  className="truncate font-display text-base font-extrabold leading-tight hover:text-brand-purple sm:text-lg"
                >
                  {inf.name}
                </Link>
                {!inf.active && <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-bold text-black/40">inactive</span>}
                {inf.pricePerDay == null && <span className="rounded-full bg-brand-yellow/30 px-2 py-0.5 text-[11px] font-bold text-yellow-800">no price</span>}
              </div>
              <div className="mt-0.5 truncate text-sm text-brand-ink/55">
                <span className="font-bold text-brand-purple">{formatGBP(inf.pricePerDay)}</span>
                {inf.theme ? ` · ${inf.theme}` : ""}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:gap-2">
              <Link
                href={`/admin/inflatables/${inf.id}`}
                className="rounded-full bg-brand-purple px-4 py-2 text-center text-sm font-bold text-white hover:brightness-110"
              >
                Edit
              </Link>
              <form action={toggleInflatable}>
                <input type="hidden" name="id" value={inf.id} />
                <button className="w-full rounded-full px-3 py-2 text-sm font-bold text-brand-ink/60 ring-1 ring-black/10 hover:bg-black/5 sm:w-auto">
                  {inf.active ? "Hide" : "Show"}
                </button>
              </form>
            </div>
          </div>
        ))}
        {inflatables.length === 0 && (
          <div className="rounded-2xl bg-brand-violet/5 p-6 text-center">
            <p className="font-bold text-brand-ink">No inflatables yet.</p>
            <p className="mt-1 text-sm text-brand-ink/60">Load the starter catalogue (your 20 castles, prices and photos) in one click — then edit anything you like.</p>
            <form action={seedCatalogue} className="mt-4">
              <button className="btn-primary">Load starter catalogue</button>
            </form>
            <p className="mt-3 text-xs text-brand-ink/40">Or add castles individually with the button above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
