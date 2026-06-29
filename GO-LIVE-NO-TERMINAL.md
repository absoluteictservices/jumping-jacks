# Go live — no terminal, all in your web browser

Everything here is done by clicking around websites. No Terminal, no commands.
You already have **Vercel**, **Resend** and **Stripe**. You'll also make a free
**GitHub** account (that's where the code lives so Vercel can publish it).

You'll use the file I packaged for you: **`jumping-jacks-code.zip`** (in your
project folder). **Double-click it to unzip** — you'll get a folder called
`jumping-jacks`. Keep that open in Finder.

Total time ~40 minutes, most of it waiting on sign-ups and one build.

---

## Step 1 — Put the code on GitHub (~10 min)

1. Go to <https://github.com/signup> and create a free account (if you don't have one).
2. Once logged in, click the **+** (top-right) → **New repository**.
3. Repository name: `jumping-jacks`. Set it to **Private**. Click **Create repository**.
4. On the next page, click the link **“uploading an existing file.”**
5. Open the unzipped **`jumping-jacks`** folder in Finder. Select **everything
   inside it** (click one file, press ⌘+A to select all), and **drag it onto the
   GitHub upload area**. Wait for all files to finish uploading.
   - Important: drag the files that are *inside* the folder (so `package.json`
     ends up at the top level), not the folder itself.
6. Scroll down, click **Commit changes**. Your code is now on GitHub. ✅

---

## Step 2 — Import it into Vercel (~5 min)

7. Go to <https://vercel.com/new>.
8. Click **Import** next to your `jumping-jacks` GitHub repo. (If Vercel asks to
   connect to GitHub, click **Install / Authorize** and allow it to see the repo.)
9. Vercel detects **Next.js** automatically. Leave the defaults and click **Deploy**.
10. This first build will **fail with a red "Error"** — that is expected and fine,
    because the database isn't connected yet. We fix it in the next step. 👍

---

## Step 3 — Add the database (~5 min)

11. In your new project, click the **Storage** tab → **Create Database** → choose
    **Neon** (Postgres) → pick region **London (lhr)** if offered → **Create**, then
    **Connect** it to this project. Vercel adds the database settings automatically.
12. Go to **Settings → Environment Variables**. You'll see `DATABASE_URL` and
    `DATABASE_URL_UNPOOLED` were added. Add **one more**:
    - Click **Add New**. Key: `DIRECT_URL`. Value: copy the value shown for
      `DATABASE_URL_UNPOOLED` and paste it in. Save.

---

## Step 4 — Add your settings (~5 min)

13. Still in **Settings → Environment Variables**, add these (click **Add New** for
    each; leave Environment set to all):

    | Key | Value |
    |---|---|
    | `ADMIN_PASSWORD` | a password you choose (you'll log into the admin with this) |
    | `ADMIN_SESSION_SECRET` | a long random jumble of letters/numbers (~40 chars) |
    | `CRON_SECRET` | another long random jumble |

14. Find your site address: top of the project, the **Domains** box shows something
    like `jumping-jacks-xxxx.vercel.app`. Add one more variable:

    | Key | Value |
    |---|---|
    | `NEXT_PUBLIC_SITE_URL` | `https://` + that address (no slash at the end) |

---

## Step 5 — Deploy again (now it works) (~3 min)

15. Click the **Deployments** tab → on the top row click the **•••** menu →
    **Redeploy** → confirm **Redeploy**.
16. Wait ~2 minutes for the green **Ready**. The database tables are created
    automatically during this build.

---

## Step 6 — Load your castles (~1 min) ⭐

17. Visit **`https://your-address.vercel.app/admin`** and log in with the
    `ADMIN_PASSWORD` you chose.
18. Open the **Inflatables** tab and click **“Load starter catalogue.”** Your 20
    castles, prices and photos appear. Edit anything here whenever you like — no
    redeploys, no code.

---

## Step 7 — Turn on payments (Stripe) (~10 min)

Start in **Test mode** (toggle, top-right of the Stripe dashboard) so you can trial
it safely.

19. Stripe → **Developers → API keys**. Copy the **Publishable key** (`pk_…`) and
    the **Secret key** (`sk_…`).
20. Back in Vercel → **Settings → Environment Variables**, add:

    | Key | Value |
    |---|---|
    | `STRIPE_SECRET_KEY` | `sk_…` |
    | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_…` |

21. Stripe → **Developers → Webhooks → Add endpoint**:
    - Endpoint URL: `https://your-address.vercel.app/api/webhooks/stripe`
    - Click **Select events** → tick **`checkout.session.completed`** → Add endpoint.
    - On the endpoint page, **Reveal** the **Signing secret** (`whsec_…`) and add in Vercel:

    | Key | Value |
    |---|---|
    | `STRIPE_WEBHOOK_SECRET` | `whsec_…` |

---

## Step 8 — Turn on emails (Resend) (~5 min, + DNS wait)

22. Resend → **API Keys** → **Create** → copy it (`re_…`).
23. Resend → **Domains** → add `jumpingjacksleeds.co.uk` and add the DNS records it
    shows you, in whoever manages your domain. *(No access to that right now? Skip
    this — bookings still work; emails just won't send until it's verified.)*
24. In Vercel add:

    | Key | Value |
    |---|---|
    | `RESEND_API_KEY` | `re_…` |
    | `EMAIL_FROM` | `Jumping Jacks Leeds <bookings@jumpingjacksleeds.co.uk>` |
    | `OWNER_EMAIL` | `info@jumpingjacksleeds.co.uk` |

---

## Step 9 — Final deploy & test (~5 min)

25. Vercel → **Deployments → ••• → Redeploy** (so all the Stripe/Resend keys take effect).
26. Open your site, book any castle, and pay with Stripe's **test card**:
    `4242 4242 4242 4242`, any future expiry date, any 3 digits for CVC.
27. Check the booking shows as **paid** in `/admin → Bookings`, and (if you set up
    Resend) that the confirmation emails arrive.

## Step 10 — Switch to real money

28. When you're happy, switch Stripe to **Live mode**, repeat **Step 7** with the
    live `pk_…`/`sk_…` keys and a live webhook, then **Redeploy** once more.
    You're now taking real bookings. 🎉

---

## Later: your own web address

Vercel → **Settings → Domains** → add `www.jumpingjacksleeds.co.uk` and follow the
DNS instructions. Then update `NEXT_PUBLIC_SITE_URL` to the new address and Redeploy.

## Updating the site day-to-day

Just log into `/admin` — add/edit castles and prices, block out dates, view and
cancel bookings, change delivery-per-day limits, lead time and coverage. None of
that needs a redeploy.

## If something looks wrong

Almost always it's a missing environment variable. Re-check Steps 3–4 and Step 7,
then Redeploy. Tell me the step number and what you see and I'll sort it.
