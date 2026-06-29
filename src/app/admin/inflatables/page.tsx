import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatGBP } from "@/lib/money";
import { toggleInflatable, seedCatalogue } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminInflatables() {
  const inflatables = await prisma.inflatable.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Inflatables</h2>
        <Link href="/admin/inflatables/new" className="btn-primary !py-2 text-sm">+ Add inflatable</Link>
      </div>

      <div className="mt-4 grid gap-3">
        {inflatables.map((inf) => (
          <div key={inf.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-extrabold">{inf.name}</span>
                {!inf.active && <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-bold text-black/40">inactive</span>}
                {inf.pricePerDay == null && <span className="rounded-full bg-brand-yellow/30 px-2 py-0.5 text-xs font-bold text-yellow-800">price not set</span>}
              </div>
              <div className="text-sm text-brand-ink/50">{formatGBP(inf.pricePerDay)} · {inf.theme ?? "—"} · order {inf.sortOrder}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/inflatables/${inf.id}`} className="btn-secondary !py-2 text-sm">Edit</Link>
              <form action={toggleInflatable}>
                <input type="hidden" name="id" value={inf.id} />
                <button className="rounded-full px-3 py-2 text-sm font-bold text-brand-purple hover:bg-brand-violet/10">
                  {inf.active ? "Deactivate" : "Activate"}
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
