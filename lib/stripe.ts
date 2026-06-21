import "server-only";
import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;

if (!secret) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set. Add it to .env.local (use a sk_test_… key).",
  );
}

// Single shared server-side Stripe client. apiVersion is omitted so the SDK
// uses the version pinned to this package release (matches the bundled types).
export const stripe = new Stripe(secret, {
  appInfo: { name: "we-pray-to-flourish" },
});
