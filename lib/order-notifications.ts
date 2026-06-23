import "server-only";
import { sendOrderEmails } from "./email";
import { sql } from "./db";
import type { OrderRow } from "./orders";

/**
 * Send purchase emails once per order. Idempotent across the finalize route
 * and the Stripe webhook — whichever claims the row first sends; the other no-ops.
 */
export async function notifyOrderIfNeeded(
  paymentIntentId: string,
): Promise<void> {
  const claimed = await sql`
    UPDATE orders
    SET notification_sent_at = now()
    WHERE stripe_payment_intent_id = ${paymentIntentId}
      AND notification_sent_at IS NULL
    RETURNING id, stripe_payment_intent_id, email, name, address_line, city,
              postal_code, country, qty, subtotal_cents, shipping_cents, tax_cents,
              total_cents, currency, status, created_at, notification_sent_at
  `;

  const order = claimed[0] as OrderRow | undefined;
  if (!order) return;

  const result = await sendOrderEmails(order);
  if (!result.ok) {
    // Clear the claim so Stripe retries / a later finalize can try again.
    await sql`
      UPDATE orders
      SET notification_sent_at = NULL
      WHERE stripe_payment_intent_id = ${paymentIntentId}
    `;
    console.error(
      "[order-notifications] failed for",
      paymentIntentId,
      result.error,
    );
  }
}