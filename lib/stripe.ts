import "server-only";
import Stripe from "stripe";

// Lazily constructed so importing this module never throws at build time (e.g.
// on Vercel before STRIPE_SECRET_KEY is set). The error is deferred to the first
// actual Stripe call at runtime.
let client: Stripe | null = null;
function getClient(): Stripe {
  if (!client) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to .env.local (use a sk_test_… key).",
      );
    }
    client = new Stripe(secret, { appInfo: { name: "we-pray-to-flourish" } });
  }
  return client;
}

// Same shape as the SDK client; property access initializes it on first use,
// so existing `stripe.paymentIntents.create(...)` call sites are unchanged.
export const stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    return getClient()[prop as keyof Stripe];
  },
});
