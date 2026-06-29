# Jumping Jacks Leeds — website & booking system

A fast, mobile-first marketing site with a working online booking system for
**Jumping Jacks**, a Leeds bouncy castle hire business. Customers pick an
inflatable, choose an available date, pay in full via Stripe, and get a 
confirmation email. The owner manages everything from `/admin` — no code needed.

Built with **Next.js (App Router, TypeScript)**, **Prisma + Postgres**,
**Stripe Checkout**, **Resend** (email) and **Tailwind CSS**. Deploys to **Vercel**.

---

## 1. Quick start (local)

```bash
npm install
cp .env.example .env        # then fill in the values (see section 3)
npx prisma migrate deploy   # create tables + safety index (from prisma/migrations)
npm run dev                 # http://localhost:3000
```

Then visit `/admin` (log in with `ADMIN_PASSWORD`) → **Inflatables** →
**“Load starter catalogue”** to populate your 20 castles. Visit `/` for the site.

> **Going live? Use `DEPLOYMENT.md`** — a plain-English, click-by-click guide to
> putting this online on Vercel with a database, payments and emails.

---

## 2. How the availability rules work (the important bit)

All booking/availability state lives in the database — the client is never
trusted. The rules live in `src/lib/availability.ts` as **pure functions** that
are exhaustively unit-tested (`src/lib/availability.test.ts`).

1. **Per-castle.** Each inflatable is one physical unit. It's unavailable on a
   date if a paid booking — or a live (unexpired) hold — already exists for it.
2. **Daily delivery cap ("one van").** `maxDeliveriesPerDay` (default **1**).
   When the number of bookings on a date hits the cap, that date is unavailable
   for *every* inflatable. Raise it in admin when you add delivery capacity.
3. **Blackout dates.** Admin can mark dates unbookable (holidays, maintenance).
4. **Lead time.** `minLeadTimeDays` (default **1** = no same-day; bookable from
   tomorrow).
5. **Holds.** Starting checkout places a 15-minute hold so two people can't buy
   the same slot. The booking is only confirmed by the **Stripe webhook** after
   payment — never on the browser redirect. Expired holds auto-release.

Run the tests:

```bash
npm test
```

> Note: the test runner is Vitest. If your environment has issues with Vitest's
> worker pool, the same suite can be run by bundling against any test shim — but
> `npm test` is the normal path and all 27 cases pass.

---

## 3. Environment variables

Copy `.env.example` → `.env` and fill in. On Vercel, add each under
**Project → Settings → Environment Variables**.

| Variable | What it's for |
|---|---|
| `DATABASE_URL` | Postgres connection (Supabase/Neon). Use the pooled URL on Supabase. |
| `DIRECT_URL` | Direct Postgres URL for Prisma migrations. |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, no trailing slash. Used for Stripe redirects & emails. |
| `STRIPE_SECRET_KEY` | Stripe secret key. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key. |
| `STRIPE_WEBHOOK_SECRET` | From the Stripe webhook endpoint (section 5). |
| `RESEND_API_KEY` | Resend API key for transactional email. |
| `EMAIL_FROM` | Verified sender, e.g. `Jumping Jacks <bookings@jumpingjacksleeds.co.uk>`. |
| `OWNER_EMAIL` | Where owner notifications go. |
| `ADMIN_PASSWORD` | Owner login password for `/admin`. |
| `ADMIN_SESSION_SECRET` | Long random string to sign the admin cookie. |
| `CRON_SECRET` | Protects the hold-cleanup cron endpoint. |

---

## 4. Database

The schema is shipped as a Prisma migration in `prisma/migrations/0_init`, which
**also creates the partial unique index** (Prisma can't express that in the
schema itself). That index guarantees at the database level that one inflatable
can never have two active bookings on the same date, even under a race — the
Serializable transaction in `createHold()` is the first line of defence, this is
the backstop.

On Vercel this applies **automatically**: the build command runs
`prisma migrate deploy` before building. Locally:

```bash
npx prisma migrate deploy      # applies 0_init (tables + index)
# or, while developing the schema:
npx prisma migrate dev
```

**Loading the catalogue (your 20 castles):** no command line needed — log in to
`/admin → Inflatables` and click **“Load starter catalogue.”** (A CLI equivalent,
`npm run seed`, is also available if you prefer.)

---

## 5. Stripe

1. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. Create a webhook endpoint pointing at `https://YOUR_DOMAIN/api/webhooks/stripe`
   subscribed to **`checkout.session.completed`**. Copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.
3. Local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Use the `whsec_…` it prints as your local `STRIPE_WEBHOOK_SECRET`.

The webhook is the **source of truth** — it re-validates and confirms the
booking, then sends both emails. The success page is informational only.

---

## 6. Email (Resend)

Add a verified domain in Resend, set `RESEND_API_KEY`, `EMAIL_FROM` and
`OWNER_EMAIL`. On a paid booking the customer gets a confirmation and the owner
gets a notification. The contact form also emails the owner. If `RESEND_API_KEY`
is missing, emails are skipped (logged) so the rest of the flow still works.

---

## 7. Deploy to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add all env vars from section 3.
3. Build command is `prisma generate && next build` (already in `package.json`).
4. Run `prisma migrate deploy` + the manual index against your production DB
   (e.g. from your machine pointing `DATABASE_URL` at prod, or a one-off job).
5. `vercel.json` registers a **cron every 10 minutes** that hits
   `/api/holds/cleanup` to release abandoned holds. Vercel automatically sends
   the `CRON_SECRET` as a bearer token — just set `CRON_SECRET` in env.

---

## 8. Admin panel (`/admin`)

Single-owner login (`ADMIN_PASSWORD`). From here you can:

- **Overview** — upcoming deliveries, active holds, totals, revenue.
- **Bookings** — view/filter all bookings, cancel one (frees the date).
- **Inflatables** — add / edit / activate / deactivate, set price, paste image URLs, reorder.
- **Blackout dates** — block specific days for everything.
- **Settings** — `maxDeliveriesPerDay`, lead time, hold minutes, delivery
  postcode prefixes, company contact details, and the cancellation policy text.

> Cancelling a *paid* booking frees the date but does **not** auto-refund —
> process refunds in your Stripe dashboard.

---

## 9. Things to confirm before launch

Most defaults are now finalised. Worth a quick review:

- **Cancellation / refund policy** — a real policy is now in place (free
  reschedule/refund with 48h notice; no refund inside 48h; free reschedule or
  refund if *we* cancel for weather/safety). Shown in Admin → Settings and the
  FAQ. Tweak the wording if you'd like.
- **Prices & descriptions** — imported from your export and tidied up (the thin
  ones like "Barbie disco castle" were rewritten). Double-check prices are
  current; edit any in Admin → Inflatables.
- **Wind figure** — the FAQ states inflatables can't be used safely above ~24mph
  gusts. Adjust if your own policy differs.
- **Delivery coverage** — accepts any **LS** postcode by default. Add prefixes
  (e.g. `WF`, `BD`) in Admin → Settings.
- **Bluetooth Speaker** — seeded **inactive** as an add-on (it would otherwise
  consume a delivery slot). Decide how you want to offer add-ons.
- **Images** point at your existing WordPress media URLs. They work while that
  site is up; ideally re-upload to your own storage and update URLs in Admin.

---

## 10. Project structure

```
prisma/
  schema.prisma         data model
  seed.ts               catalogue + settings (from your WooCommerce export)
  manual-indexes.sql    partial unique index (run once)
src/
  lib/
    availability.ts          PURE availability engine (unit-tested)
    availability.test.ts     27 tests covering every rule + race scenarios
    availability.server.ts   DB-backed availability, race-safe holds, confirm
    dates.ts money.ts site.ts settings.ts prisma.ts stripe.ts email.ts auth.ts
  components/           Header, Footer, CastleCard, BookingWidget, ContactForm…
  app/
    page.tsx  castles/  book/  booking/confirmed/  about/  faqs/  gallery/  contact/
    admin/                     password-protected owner panel + server actions
    api/availability  api/checkout  api/webhooks/stripe  api/contact  api/holds/cleanup
```
