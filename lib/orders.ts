import "server-only";
import type Stripe from "stripe";
import { sql } from "./db";

export type OrderItemRow = {
  id: number;
  order_id: number;
  product_id: string;
  product_title: string;
  product_author: string;
  product_format: string;
  unit_price_cents: number;
  qty: number;
  line_subtotal_cents: number;
};

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
  notification_sent_at: string | null;
};

export type OrderWithItems = OrderRow & { items: OrderItemRow[] };

export type OrderItemInput = {
  productId: string;
  productTitle: string;
  productAuthor: string;
  productFormat: string;
  unitPriceCents: number;
  qty: number;
  lineSubtotalCents: number;
};

/** Orders for the admin CRM, newest first. */
export async function getOrders(limit = 200): Promise<OrderRow[]> {
  const rows = await sql`
    SELECT id, stripe_payment_intent_id, email, name, address_line, city,
           postal_code, country, qty, subtotal_cents, shipping_cents, tax_cents,
           total_cents, currency, status, created_at, notification_sent_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as OrderRow[];
}

/** Orders with normalized line items for admin + email. */
export async function getOrdersWithItems(limit = 200): Promise<OrderWithItems[]> {
  const orders = await getOrders(limit);
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const itemRows = await sql`
    SELECT id, order_id, product_id, product_title, product_author, product_format,
           unit_price_cents, qty, line_subtotal_cents
    FROM order_items
    WHERE order_id = ANY(${orderIds})
    ORDER BY id ASC
  `;
  const items = itemRows as OrderItemRow[];
  const byOrder = new Map<number, OrderItemRow[]>();
  for (const item of items) {
    const list = byOrder.get(item.order_id) ?? [];
    list.push(item);
    byOrder.set(item.order_id, list);
  }

  return orders.map((o) => ({ ...o, items: byOrder.get(o.id) ?? [] }));
}

/** Line items for a single order (emails, detail views). */
export async function getOrderItems(orderId: number): Promise<OrderItemRow[]> {
  const rows = await sql`
    SELECT id, order_id, product_id, product_title, product_author, product_format,
           unit_price_cents, qty, line_subtotal_cents
    FROM order_items
    WHERE order_id = ${orderId}
    ORDER BY id ASC
  `;
  return rows as OrderItemRow[];
}

/** Total number of recorded orders (for the dashboard). */
export async function getOrderCount(): Promise<number> {
  const rows = await sql`SELECT count(*)::int AS count FROM orders`;
  return (rows[0]?.count as number) ?? 0;
}

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
    notification_sent_at      TIMESTAMPTZ,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

export const ORDER_ITEMS_DDL = `
  CREATE TABLE IF NOT EXISTS order_items (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id            BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id          TEXT NOT NULL,
    product_title       TEXT NOT NULL,
    product_author      TEXT NOT NULL,
    product_format      TEXT NOT NULL,
    unit_price_cents    INTEGER NOT NULL,
    qty                 INTEGER NOT NULL,
    line_subtotal_cents INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);
`;

export async function ensureOrdersTable(): Promise<void> {
  await sql.query(ORDERS_DDL);
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ`;
  await sql.query(ORDER_ITEMS_DDL);
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
 * Insert an order + line items, keyed on the Stripe PaymentIntent id.
 * Idempotent: duplicate finalize/webhook calls update the order header and
 * replace line items rather than creating duplicates.
 */
export async function upsertOrder(o: OrderInput, items: OrderItemInput[]) {
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
      country = EXCLUDED.country,
      qty = EXCLUDED.qty,
      subtotal_cents = EXCLUDED.subtotal_cents,
      shipping_cents = EXCLUDED.shipping_cents,
      tax_cents = EXCLUDED.tax_cents,
      total_cents = EXCLUDED.total_cents
    RETURNING id, stripe_payment_intent_id, status, created_at;
  `;
  const order = rows[0] as { id: number };
  const orderId = order.id;

  await sql`DELETE FROM order_items WHERE order_id = ${orderId}`;
  for (const item of items) {
    await sql`
      INSERT INTO order_items (
        order_id, product_id, product_title, product_author, product_format,
        unit_price_cents, qty, line_subtotal_cents
      ) VALUES (
        ${orderId}, ${item.productId}, ${item.productTitle}, ${item.productAuthor},
        ${item.productFormat}, ${item.unitPriceCents}, ${item.qty}, ${item.lineSubtotalCents}
      )
    `;
  }

  return rows[0];
}

const toInt = (v: string | undefined, fallback = 0) => {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
};

type MetadataLineItem = {
  productId: string;
  title: string;
  author: string;
  format: string;
  qty: number;
  unitPriceCents: number;
  lineSubtotalCents: number;
};

function parseLineItems(metadata: Stripe.Metadata): OrderItemInput[] {
  const raw = metadata.line_items;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as MetadataLineItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((l) => ({
          productId: l.productId,
          productTitle: l.title,
          productAuthor: l.author,
          productFormat: l.format,
          unitPriceCents: l.unitPriceCents,
          qty: l.qty,
          lineSubtotalCents: l.lineSubtotalCents,
        }));
      }
    } catch {
      /* fall through to legacy */
    }
  }

  // Legacy single-product metadata.
  const title = metadata.product ?? "Product";
  const qty = toInt(metadata.qty, 1);
  const subtotal = toInt(metadata.subtotal_cents);
  const unit = qty > 0 ? Math.round(subtotal / qty) : subtotal;
  return [
    {
      productId: "legacy",
      productTitle: title,
      productAuthor: metadata.author ?? "",
      productFormat: metadata.format ?? "",
      unitPriceCents: unit,
      qty,
      lineSubtotalCents: subtotal,
    },
  ];
}

/**
 * Map a succeeded Stripe PaymentIntent into an order row and persist it.
 * Pulls customer + price details from the intent metadata set in
 * /api/checkout/intent. Shared by the finalize route and the webhook.
 */
export async function recordOrderFromIntent(intent: Stripe.PaymentIntent) {
  const m = intent.metadata ?? {};
  const email = m.email || intent.receipt_email || "";
  const name = m.name || "";
  const items = parseLineItems(m);

  return upsertOrder(
    {
      stripePaymentIntentId: intent.id,
      email,
      name,
      addressLine: m.address_line ?? null,
      city: m.city ?? null,
      postalCode: m.postal_code ?? null,
      country: m.country ?? null,
      qty: toInt(m.qty, items.reduce((s, i) => s + i.qty, 0)),
      subtotalCents: toInt(m.subtotal_cents),
      shippingCents: toInt(m.shipping_cents),
      taxCents: toInt(m.tax_cents),
      totalCents: toInt(m.total_cents, intent.amount),
      currency: intent.currency,
      status: "paid",
    },
    items,
  );
}