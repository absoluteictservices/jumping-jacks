import Link from "next/link";
import { getActiveInflatables } from "@/lib/inflatables";
import { CastleCard } from "@/components/CastleCard";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const VALUE_PROPS = [
  { icon: "🛡️", title: "Safe & clean", body: "Every inflatable is cleaned, safety-checked and PIPA-style inspected before it reaches your garden." },
  { icon: "🚚", title: "We deliver & set up", body: "Delivered and set up in the morning, collected in the evening. You don't lift a finger." },
  { icon: "💷", title: "Simple online booking", body: "Pick a castle, choose your date, pay securely. Confirmed in minutes — no phone tag." },
];

const STEPS = [
  { n: 1, title: "Pick your castle", body: "Browse our range and choose the perfect inflatable for the party." },
  { n: 2, title: "Choose an available date", body: "Our live calendar only shows dates we can actually deliver." },
  { n: 3, title: "Pay & relax", body: "Pay securely online and get instant confirmation by email." },
];

const REASONS = [
  { icon: "✨", title: "Spotless & cared for", body: "Our inflatables are cleaned and checked before every single hire, so they arrive fresh and well-presented." },
  { icon: "⏰", title: "On time, every time", body: "We deliver and set up in good time and confirm your slot the day before — no last-minute surprises." },
  { icon: "💬", title: "Local & friendly", body: "A family-run Leeds business with 13+ years' experience. Call us any time and you'll speak to a real person." },
];

export default async function HomePage() {
  const castles = await getActiveInflatables();
  const popular = castles.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-purple via-brand-violet to-brand-pink text-white">
        <div className="dotty absolute inset-0 opacity-30" />
        <div className="container-x relative grid items-center gap-8 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="chip bg-white/15 text-white">⭐ {SITE.yearsExperience}+ years of bouncing fun in Leeds</span>
            <h1 className="mt-4 text-4xl leading-tight sm:text-5xl md:text-6xl">
              Fun Bouncy Castle Hire in Leeds
            </h1>
            <p className="mt-4 max-w-md text-lg text-white/90">
              Safe, clean and affordable inflatables delivered to your door across {SITE.areaServed}. Book online in minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/castles" className="btn-sun">See our castles & book</Link>
              <a href={`tel:${SITE.phone}`} className="btn-secondary !bg-white/10 !text-white !border-white/30">
                Call {SITE.phoneDisplay}
              </a>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="animate-bob rounded-5xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur">
              <div className="aspect-square rounded-4xl bg-gradient-to-br from-brand-yellow to-brand-pink shadow-playful" />
              <p className="mt-4 text-center font-display text-2xl font-extrabold">Let's get bouncing! 🎉</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="container-x -mt-10 grid gap-4 sm:grid-cols-3">
        {VALUE_PROPS.map((v) => (
          <div key={v.title} className="card p-6">
            <div className="text-3xl">{v.icon}</div>
            <h3 className="mt-3 text-lg">{v.title}</h3>
            <p className="mt-1 text-sm text-brand-ink/70">{v.body}</p>
          </div>
        ))}
      </section>

      {/* Popular castles */}
      <section className="container-x py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl">Popular bouncy castles</h2>
            <p className="mt-2 text-brand-ink/70">Our most-booked inflatables for parties across Leeds.</p>
          </div>
          <Link href="/castles" className="hidden font-bold text-brand-purple hover:underline sm:block">
            View all →
          </Link>
        </div>
        {popular.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((c, i) => (
              <CastleCard key={c.slug} castle={c} index={i} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl bg-brand-violet/5 p-6 text-brand-ink/60">
            Our castles will appear here once the database is connected and seeded.
          </p>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/castles" className="btn-secondary">View all castles</Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brand-violet/5 py-16">
        <div className="container-x">
          <h2 className="text-center text-3xl">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative card p-6 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-pink font-display text-xl font-extrabold text-white">
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg">{s.title}</h3>
                <p className="mt-1 text-sm text-brand-ink/70">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/castles" className="btn-primary">Book your castle now</Link>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="container-x py-16">
        <h2 className="text-center text-3xl">Why Leeds families choose us</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {REASONS.map((r) => (
            <div key={r.title} className="card p-6">
              <div className="text-3xl">{r.icon}</div>
              <h3 className="mt-3 text-lg">{r.title}</h3>
              <p className="mt-1 text-sm text-brand-ink/70">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-x pb-4">
        <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-brand-sky to-brand-violet p-10 text-center text-white">
          <div className="dotty absolute inset-0 opacity-30" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl">Ready to make the party unforgettable?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/90">
              Book your bouncy castle today — quick, secure and confirmed instantly.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/castles" className="btn-sun">Book Now</Link>
              <a href={`tel:${SITE.phone}`} className="btn-secondary !bg-white/10 !text-white !border-white/30">
                {SITE.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
