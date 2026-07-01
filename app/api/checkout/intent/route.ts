import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { priceForCart, type CartLine } from "@/lib/pricing";
import { getFeaturedProduct, getSiteContent } from "@/lib/content";

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
  lines?: CartLine[];
  /** Legacy single-product qty (uses featured product). */
  qty?: number;
  paymentIntentId?: string;
  customer?: Customer;
};

function resolveLines(body: Body, featuredId: string): CartLine[] {
  if (body.lines?.length) {
    return body.lines
      .filter((l) => l.productId && l.qty > 0)
      .map((l) => ({ productId: l.productId, qty: l.qty }));
  }
  return [{ productId: featuredId, qty: body.qty ?? 1 }];
}

/**
 * Create or update the PaymentIntent for the order.
 *
 * The amount is ALWAYS computed server-side from cart lines (priceForCart) —
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

  const site = await getSiteContent();
  if (site.products.length === 0) {
    return NextResponse.json({ error: "No products configured" }, { status: 400 });
  }
  const featured = await getFeaturedProduct();
  const lines = resolveLines(body, featured!.id);
  const breakdown = priceForCart(lines, site.products, site.commerce);

  if (breakdown.lines.length === 0 || breakdown.amountInCents < 1) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const c = body.customer ?? {};

  const metadata: Record<string, string> = {
    qty: String(breakdown.qty),
    subtotal_cents: String(Math.round(breakdown.subtotal * 100)),
    shipping_cents: String(Math.round(breakdown.shipping * 100)),
    tax_cents: String(Math.round(breakdown.tax * 100)),
    total_cents: String(breakdown.amountInCents),
    line_items: JSON.stringify(
      breakdown.lines.map((l) => ({
        productId: l.productId,
        title: l.title,
        author: l.author,
        format: l.format,
        qty: l.qty,
        unitPriceCents: l.unitPriceCents,
        lineSubtotalCents: l.lineSubtotalCents,
      })),
    ),
    // Legacy single-line fields (first item) for older tooling.
    product: breakdown.lines[0]?.title ?? "",
  };
  if (c.email) metadata.email = c.email;
  if (c.name) metadata.name = c.name;
  if (c.addressLine) metadata.address_line = c.addressLine;
  if (c.city) metadata.city = c.city;
  if (c.postalCode) metadata.postal_code = c.postalCode;
  if (c.country) metadata.country = c.country;

  try {
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