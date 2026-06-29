# Go live — step-by-step checklist

Everything in the code is done, tested, and automated as far as possible:
the database tables and safety index apply themselves on deploy, and you load
your castles with one button click in the admin — no command line database work.

You have **Stripe**. You'll create two free accounts as you go: **Vercel**
(hosting) and **Resend** (emails). No GitHub needed.

Commands in grey boxes go in the **Terminal** app (⌘+Space → "Terminal" → Enter).
Roughly **45–60 minutes**, most of it waiting on sign-ups.

---

## Part 1 — Tools (one time, ~10 min)

1. Install **Node.js**: <https://nodejs.org> → big green **LTS** button → run the installer.
   Check it worked:
   ```bash
   node -v
   ```
2. Install the Vercel tool:
   ```bash
   npm install -g vercel
   ```

## Part 2 — Accounts (~5 min)

3. **Vercel**: sign up at <https://vercel.com/signup> (free Hobby plan).
4. **Resend**: sign up at <https://resend.com> (free plan).

## Part 3 — Create the project on Vercel (~5 min)

5. In Terminal:
   ```bash
   cd "/Users/hasan/Documents/Claude/Projects/Jumping Jacks"
   npm install
   vercel login
   vercel link
   ```
   For `vercel link`: **Set up new project? Y** → pick your account → name it
   `jumping-jacks` → it detects Next.js, accept defaults. (This creates the
   project on Vercel but doesn't deploy yet — that's deliberate.)

## Part 4 — Add the database (~5 min)

6. Go to <https://vercel.com> → your **jumping-jacks** project → **Storage** →
   **Create Database** → **Neon** (Postgres) → region **London** if offered →
   **Connect** to the project. This auto-adds `DATABASE_URL` and
   `DATABASE_URL_UNPOOLED` to the project.

7. Project → **Settings → Environment Variables** → add one more:

   | Name | Value |
   |---|---|
   | `DIRECT_URL` | paste the value shown for `DATABASE_URL_UNPOOLED` (if it's not there, use the same value as `DATABASE_URL`) |

## Part 5 — Basic settings (~5 min)

8. Still in **Settings → Environment Variables**, add these (Environment: **All**):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | leave blank for now — fill in after the first deploy gives you a URL |
   | `ADMIN_PASSWORD` | a password you choose (for the owner login) |
   | `ADMIN_SESSION_SECRET` | a long random string (~40 chars) |
   | `CRON_SECRET` | another long random string |

## Part 6 — First deploy (~5 min)

9. Deploy:
   ```bash
   vercel --prod
   ```
   When it finishes it prints a URL like `https://jumping-jacks-xxxx.vercel.app`.
   The database tables are created automatically during this deploy.

10. Copy that URL, set `NEXT_PUBLIC_SITE_URL` to it in Vercel (Settings → Env
    Vars), then redeploy once more so links/emails use it:
    ```bash
    vercel --prod
    ```

## Part 7 — Load your castles (~1 min) ⭐

11. Visit **`YOUR-URL/admin`**, log in with your `ADMIN_PASSWORD`, go to the
    **Inflatables** tab and click **“Load starter catalogue.”** Your 20 castles,
    prices and photos appear instantly. Edit anything from here — no code, no
    redeploy needed.

## Part 8 — Payments (Stripe) (~10 min)

12. Stripe dashboard → **Developers → API keys**. Start in **Test mode** to trial
    safely. Copy the **Publishable** (`pk_…`) and **Secret** (`sk_…`) keys.
13. Vercel → Settings → Environment Variables, add:

    | Name | Value |
    |---|---|
    | `STRIPE_SECRET_KEY` | `sk_…` |
    | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_…` |

14. Stripe → **Developers → Webhooks → Add endpoint**:
    - URL: `https://YOUR-URL/api/webhooks/stripe`
    - Event: **`checkout.session.completed`**
    - Create, then **Reveal** the signing secret (`whsec_…`) and add in Vercel:

    | Name | Value |
    |---|---|
    | `STRIPE_WEBHOOK_SECRET` | `whsec_…` |

## Part 9 — Emails (Resend) (~5 min + DNS wait)

15. Resend → **API Keys** → create → copy (`re_…`).
16. Resend → **Domains** → add `jumpingjacksleeds.co.uk` and add the DNS records
    they show you (in your domain provider). *(No DNS access yet? Skip — you can
    add this later; bookings still work, emails just won't send until done.)*
17. Vercel → add:

    | Name | Value |
    |---|---|
    | `RESEND_API_KEY` | `re_…` |
    | `EMAIL_FROM` | `Jumping Jacks Leeds <bookings@jumpingjacksleeds.co.uk>` |
    | `OWNER_EMAIL` | `info@jumpingjacksleeds.co.uk` |

## Part 10 — Final deploy & test (~5 min)

18. Apply all the new keys:
    ```bash
    vercel --prod
    ```
19. Test a booking on your URL with Stripe's test card **4242 4242 4242 4242**,
    any future expiry, any 3-digit CVC. Confirm it shows as **paid** in
    `/admin → Bookings` and (if Resend is set up) the emails arrive.
20. When happy, repeat **Part 8** with Stripe **live** keys + a live webhook, then
    `vercel --prod`. You're taking real bookings. 🎉

---

## Custom domain (when ready)

Vercel → project → **Settings → Domains** → add `www.jumpingjacksleeds.co.uk`
and follow the DNS steps. Then update `NEXT_PUBLIC_SITE_URL` to the new domain and
`vercel --prod` once more.

## Day-to-day

Log in to `/admin` to add/edit castles and prices, block out dates, see and cancel
bookings, and change settings (deliveries-per-day, lead time, delivery postcodes).
No redeploy needed for any of that.

## If a deploy errors

The most common cause is a missing/incorrect `DATABASE_URL`/`DIRECT_URL`. Check
those are set (Part 4) and redeploy. Stuck? Tell me the step number and the error.
