import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Load Stripe.js once and reuse the promise across the app.
const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!pk) {
    console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set.");
    return Promise.resolve(null);
  }
  if (!stripePromise) stripePromise = loadStripe(pk);
  return stripePromise;
}
