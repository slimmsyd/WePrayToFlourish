import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { recordOrderFromIntent } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook — the production source of truth for fulfillment.
 *
 * Local dev: forward events with the Stripe CLI:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 * then copy the printed whsec_… into STRIPE_WEBHOOK_SECRET in .env.local.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.includes("REPLACE_ME")) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  // Signature is verified against the EXACT raw bytes — do not parse first.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe/webhook] signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await recordOrderFromIntent(intent);
        console.log("[stripe/webhook] order recorded for", intent.id);
        break;
      }
      default:
        // Other events acknowledged but not acted on.
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Handler error";
    console.error("[stripe/webhook] handler error:", message);
    // 500 -> Stripe retries delivery.
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
