import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key && process.env.NODE_ENV === "production") {
  // Fail loudly in prod; in dev we allow the app to boot without keys.
  console.warn("STRIPE_SECRET_KEY is not set.");
}

export const stripe = new Stripe(key ?? "sk_test_placeholder", {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
