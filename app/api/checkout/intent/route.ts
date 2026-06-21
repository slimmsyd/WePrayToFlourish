import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { priceFor, pricingFrom } from "@/lib/pricing";
import { getProductContent } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Customer = {
  email?: string;
  name?: string;
  addressLine?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

type Body = {
  qty?: number;
  paymentIntentId?: string;
  customer?: Customer;
};

/**
 * Create or update the PaymentIntent for the order.
 *
 * The amount is ALWAYS computed server-side from the quantity (priceFor) —
 * the client cannot dictate the charge. Customer details are stashed in
 * metadata so the webhook / finalize step can persist a complete order.
 */
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Pricing comes from the editable product content — but the amount is still
  // computed here, server-side, so the client can never dictate the charge.
  const product = await getProductContent();
  const breakdown = priceFor(body.qty ?? 1, pricingFrom(product));
  const c = body.customer ?? {};

  const metadata: Record<string, string> = {
    product: product.title,
    qty: String(breakdown.qty),
    subtotal_cents: String(Math.round(breakdown.subtotal * 100)),
    shipping_cents: String(Math.round(breakdown.shipping * 100)),
    tax_cents: String(Math.round(breakdown.tax * 100)),
    total_cents: String(breakdown.amountInCents),
  };
  if (c.email) metadata.email = c.email;
  if (c.name) metadata.name = c.name;
  if (c.addressLine) metadata.address_line = c.addressLine;
  if (c.city) metadata.city = c.city;
  if (c.postalCode) metadata.postal_code = c.postalCode;
  if (c.country) metadata.country = c.country;

  try {
    // Update an existing intent (qty changed, or finalizing with full details).
    if (body.paymentIntentId) {
      const updated = await stripe.paymentIntents.update(body.paymentIntentId, {
        amount: breakdown.amountInCents,
        metadata,
        ...(c.email ? { receipt_email: c.email } : {}),
      });
      return NextResponse.json({
        clientSecret: updated.client_secret,
        paymentIntentId: updated.id,
        breakdown,
      });
    }

    // First load — create the intent.
    const intent = await stripe.paymentIntents.create({
      amount: breakdown.amountInCents,
      currency: breakdown.currency,
      automatic_payment_methods: { enabled: true },
      metadata,
      ...(c.email ? { receipt_email: c.email } : {}),
    });

    return NextResponse.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      breakdown,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    console.error("[checkout/intent]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
