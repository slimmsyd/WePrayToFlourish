import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { recordOrderFromIntent } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Finalize an order after the browser confirms payment succeeded.
 *
 * We never trust the client's word that payment happened — we re-fetch the
 * PaymentIntent from Stripe and only persist if it actually succeeded. This
 * gives instant persistence in local dev (no Stripe CLI needed); the webhook
 * is the production-grade backstop. Both paths are idempotent.
 */
export async function POST(req: NextRequest) {
  let paymentIntentId: string | undefined;
  try {
    ({ paymentIntentId } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!paymentIntentId) {
    return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== "succeeded") {
      return NextResponse.json(
        { error: `Payment not completed (status: ${intent.status})` },
        { status: 409 },
      );
    }

    const order = await recordOrderFromIntent(intent);
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record order";
    console.error("[checkout/order]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
