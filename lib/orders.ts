import "server-only";
import type Stripe from "stripe";
import { sql } from "./db";

export type OrderRow = {
  id: number;
  stripe_payment_intent_id: string;
  email: string;
  name: string;
  address_line: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  qty: number;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  status: string;
  created_at: string;
};

/** Orders for the admin CRM, newest first. */
export async function getOrders(limit = 200): Promise<OrderRow[]> {
  const rows = await sql`
    SELECT id, stripe_payment_intent_id, email, name, address_line, city,
           postal_code, country, qty, subtotal_cents, shipping_cents, tax_cents,
           total_cents, currency, status, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as OrderRow[];
}

/** Total number of recorded orders (for the dashboard). */
export async function getOrderCount(): Promise<number> {
  const rows = await sql`SELECT count(*)::int AS count FROM orders`;
  return (rows[0]?.count as number) ?? 0;
}

// DDL for the orders table. Run via scripts/db-init.mjs (or call ensureOrdersTable).
export const ORDERS_DDL = `
  CREATE TABLE IF NOT EXISTS orders (
    id                        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    stripe_payment_intent_id  TEXT NOT NULL UNIQUE,
    email                     TEXT NOT NULL,
    name                      TEXT NOT NULL,
    address_line             TEXT,
    city                      TEXT,
    postal_code              TEXT,
    country                   TEXT,
    qty                       INTEGER NOT NULL,
    subtotal_cents            INTEGER NOT NULL,
    shipping_cents            INTEGER NOT NULL,
    tax_cents                 INTEGER NOT NULL,
    total_cents               INTEGER NOT NULL,
    currency                  TEXT NOT NULL DEFAULT 'usd',
    status                    TEXT NOT NULL DEFAULT 'paid',
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

export async function ensureOrdersTable(): Promise<void> {
  await sql.query(ORDERS_DDL);
}

export type OrderInput = {
  stripePaymentIntentId: string;
  email: string;
  name: string;
  addressLine?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  qty: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  status?: string;
};

/**
 * Insert an order, keyed on the Stripe PaymentIntent id. Idempotent: if the
 * same intent is recorded twice (e.g. the success handler AND the webhook both
 * fire), the second call updates status rather than creating a duplicate row.
 */
export async function upsertOrder(o: OrderInput) {
  const rows = await sql`
    INSERT INTO orders (
      stripe_payment_intent_id, email, name,
      address_line, city, postal_code, country,
      qty, subtotal_cents, shipping_cents, tax_cents, total_cents,
      currency, status
    ) VALUES (
      ${o.stripePaymentIntentId}, ${o.email}, ${o.name},
      ${o.addressLine ?? null}, ${o.city ?? null}, ${o.postalCode ?? null}, ${o.country ?? null},
      ${o.qty}, ${o.subtotalCents}, ${o.shippingCents}, ${o.taxCents}, ${o.totalCents},
      ${o.currency}, ${o.status ?? "paid"}
    )
    ON CONFLICT (stripe_payment_intent_id) DO UPDATE SET
      status = EXCLUDED.status,
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      address_line = EXCLUDED.address_line,
      city = EXCLUDED.city,
      postal_code = EXCLUDED.postal_code,
      country = EXCLUDED.country
    RETURNING id, stripe_payment_intent_id, status, created_at;
  `;
  return rows[0];
}

const toInt = (v: string | undefined, fallback = 0) => {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Map a succeeded Stripe PaymentIntent into an order row and persist it.
 * Pulls customer + price details from the intent metadata set in
 * /api/checkout/intent. Shared by the finalize route and the webhook.
 */
export async function recordOrderFromIntent(intent: Stripe.PaymentIntent) {
  const m = intent.metadata ?? {};
  const email = m.email || intent.receipt_email || "";
  const name = m.name || "";

  return upsertOrder({
    stripePaymentIntentId: intent.id,
    email,
    name,
    addressLine: m.address_line ?? null,
    city: m.city ?? null,
    postalCode: m.postal_code ?? null,
    country: m.country ?? null,
    qty: toInt(m.qty, 1),
    subtotalCents: toInt(m.subtotal_cents),
    shippingCents: toInt(m.shipping_cents),
    taxCents: toInt(m.tax_cents),
    totalCents: toInt(m.total_cents, intent.amount),
    currency: intent.currency,
    status: "paid",
  });
}
