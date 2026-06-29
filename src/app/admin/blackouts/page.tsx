import { prisma } from "@/lib/prisma";
import { formatDisplay, dbDateToKey, todayKey, dateKeyToUTCDate } from "@/lib/dates";
import { addBlackout, removeBlackout } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminBlackouts() {
  const blackouts = await prisma.blackoutDate.findMany({
    where: { date: { gte: dateKeyToUTCDate(todayKey()) } },
    orderBy: { date: "asc" },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="text-xl">Block out a date</h2>
        <p className="mt-2 text-sm text-brand-ink/60">Blacked-out dates are unbookable for every inflatable — use for holidays, maintenance or days off.</p>
        <form action={addBlackout} className="card mt-4 space-y-3 p-5">
          <div>
            <label htmlFor="date" className="block text-sm font-bold text-brand-ink/80">Date</label>
            <input id="date" name="date" type="date" required className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm font-bold text-brand-ink/80">Reason (optional)</label>
            <input id="reason" name="reason" className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2" placeholder="e.g. On holiday" />
          </div>
          <button className="btn-primary">Block this date</button>
        </form>
      </div>

      <div>
        <h2 className="text-xl">Upcoming blackout dates</h2>
        <div className="mt-4 grid gap-2">
          {blackouts.length === 0 && (
            <p className="rounded-2xl bg-brand-violet/5 p-5 text-brand-ink/60">No upcoming blackout dates.</p>
          )}
          {blackouts.map((b) => (
            <div key={b.id} className="card flex items-center justify-between p-4">
              <div>
                <div className="font-bold">{formatDisplay(dbDateToKey(b.date))}</div>
                {b.reason && <div className="text-sm text-brand-ink/50">{b.reason}</div>}
              </div>
              <form action={removeBlackout}>
                <input type="hidden" name="id" value={b.id} />
                <button className="text-sm font-bold text-red-600 hover:underline">Remove</button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
