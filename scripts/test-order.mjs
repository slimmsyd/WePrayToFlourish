// End-to-end test purchase: Stripe test card → order saved → customer + admin emails.
//
// Usage:
//   npm run dev   # in another terminal
//   npm run test:order
//   npm run test:order -- you@email.com
//
// Uses Stripe TEST mode (sk_test_…). Card pm_card_visa = 4242… success.

import Stripe from "stripe";

const email =
  process.argv[2]?.trim() ||
  process.env.TEST_ORDER_EMAIL?.trim() ||
  process.env.ADMIN_NOTIFICATION_EMAIL?.trim();

const base =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`✗ ${name} is not set in .env.local`);
    process.exit(1);
  }
  return value;
}

if (!email) {
  console.error("✗ No email. Pass one as an argument or set TEST_ORDER_EMAIL / ADMIN_NOTIFICATION_EMAIL.");
  console.error("  npm run test:order -- you@email.com");
  process.exit(1);
}

const stripeKey = requireEnv("STRIPE_SECRET_KEY");
if (!stripeKey.startsWith("sk_test_")) {
  console.error("✗ STRIPE_SECRET_KEY must be a test key (sk_test_…). Refusing to run against live Stripe.");
  process.exit(1);
}

const stripe = new Stripe(stripeKey);
const lines = [{ productId: "52-laws-of-you", qty: 1 }];
const customer = {
  email,
  name: "Test Customer",
  addressLine: "123 Main Street",
  city: "Atlanta",
  postalCode: "30301",
  country: "United States",
};

console.log("→ Test purchase (Stripe test mode)");
console.log(`  API: ${base}`);
console.log(`  Customer: ${customer.name} <${customer.email}>`);
console.log(`  Lines: ${JSON.stringify(lines)}`);
console.log("  Card: pm_card_visa (4242 4242 4242 4242)");

async function api(path, body) {
  let res;
  try {
    res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("✗ Could not reach the API. Is the dev server running?");
    console.error("  npm run dev");
    console.error(`  (${err.message})`);
    process.exit(1);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`✗ ${path} ${res.status}:`, data.error || data);
    process.exit(1);
  }
  return data;
}

// 1. Create PaymentIntent (server-side pricing + metadata)
const intentData = await api("/api/checkout/intent", { lines, customer });
const { paymentIntentId, breakdown } = intentData;
console.log(`✓ PaymentIntent created: ${paymentIntentId}`);
console.log(`  Total: $${(breakdown.total).toFixed(2)} ${breakdown.currency}`);

// 2. Confirm with Stripe test card (no browser)
const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, {
  payment_method: "pm_card_visa",
  return_url: `${base}/checkout`,
});
if (confirmed.status !== "succeeded") {
  console.error(`✗ Payment status: ${confirmed.status}`);
  process.exit(1);
}
console.log("✓ Payment succeeded (test card)");

// 3. Record order + send emails
const orderData = await api("/api/checkout/order", { paymentIntentId });
const order = orderData.order;
console.log(`✓ Order recorded: #${order?.id ?? "?"}`);
console.log("");
console.log("Emails triggered (check server logs + inboxes):");
console.log(`  Customer receipt → ${customer.email}`);
console.log(`  Admin alert      → ${process.env.ADMIN_NOTIFICATION_EMAIL || "(ADMIN_NOTIFICATION_EMAIL)"}`);
console.log("");
console.log("Note: Stripe is in TEST mode here. Live uses the same code with sk_live_ keys.");