// Create the `orders`, `order_items`, + `site_content` tables in Neon (idempotent).
// Run with:  node --env-file=.env.local scripts/db-init.mjs
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL not set. Run with: node --env-file=.env.local scripts/db-init.mjs");
  process.exit(1);
}

const sql = neon(url);

const DDL = `
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

const ORDER_ITEMS_DDL = `
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

const NEWSLETTER_DDL = `
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email             TEXT NOT NULL UNIQUE,
    welcome_sent_at   TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

const SITE_CONTENT_DDL = `
  CREATE TABLE IF NOT EXISTS site_content (
    id          SMALLINT PRIMARY KEY DEFAULT 1,
    data        JSONB NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT site_content_singleton CHECK (id = 1)
  );
`;

/** Empty catalog — products are added via the admin CRM. */
const DEFAULT_CONTENT = {
  commerce: {
    currency: "usd",
    shipFlatCents: 500,
    freeShipThresholdCents: 4000,
    taxRate: 0,
  },
  products: [],
};

try {
  await sql.query(DDL);
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ`;
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM orders;`;
  console.log(`✓ orders table ready (current rows: ${count})`);

  await sql.query(ORDER_ITEMS_DDL);
  const [{ itemCount }] = await sql`SELECT count(*)::int AS "itemCount" FROM order_items;`;
  console.log(`✓ order_items table ready (current rows: ${itemCount})`);

  await sql.query(NEWSLETTER_DDL);
  const [{ subs }] =
    await sql`SELECT count(*)::int AS subs FROM newsletter_subscribers;`;
  console.log(`✓ newsletter_subscribers ready (current rows: ${subs})`);

  await sql.query(SITE_CONTENT_DDL);
  await sql`
    INSERT INTO site_content (id, data)
    VALUES (1, ${JSON.stringify(DEFAULT_CONTENT)}::jsonb)
    ON CONFLICT (id) DO NOTHING
  `;
  const [{ seeded }] =
    await sql`SELECT (data ? 'products' OR data ? 'product') AS seeded FROM site_content WHERE id = 1;`;
  console.log(`✓ site_content ready (catalog present: ${seeded})`);
} catch (err) {
  console.error("✗ Failed to initialize database:", err.message);
  process.exit(1);
}