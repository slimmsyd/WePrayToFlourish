// Create the `orders` + `site_content` tables in Neon (idempotent).
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

const NEWSLETTER_DDL = `
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email             TEXT NOT NULL UNIQUE,
    welcome_sent_at   TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

// Singleton content document. `data` JSONB holds the editable site content;
// today only the `product` slice. KEEP the seed below in sync with
// DEFAULT_PRODUCT in lib/content.ts (this .mjs file cannot import the TS module).
const SITE_CONTENT_DDL = `
  CREATE TABLE IF NOT EXISTS site_content (
    id          SMALLINT PRIMARY KEY DEFAULT 1,
    data        JSONB NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT site_content_singleton CHECK (id = 1)
  );
`;

const DEFAULT_PRODUCT = {
  title: "52 Laws of You",
  author: "Yaadin",
  format: "Paperback",
  priceCents: 2400,
  currency: "usd",
  shipFlatCents: 500,
  freeShipThresholdCents: 4000,
  taxRate: 0,
  maxQty: 99,
  coverImage: "/book.png",
  coverAlt: "52 Laws of You, hardcover edition",
  hoverVideo: "/book-hover.mp4",
  tagline: "52 Laws of You",
  shortDescription:
    "52 Laws of You is the book Yaadin has ushered in: a weekly practice in becoming, for anyone learning to speak less, notice more, and flourish.",
  longDescription: [
    "52 Laws of You is a year-long practice in self-mastery. Each week offers a single law to read, sit with, and live. Small enough to begin today, deep enough to return to for a lifetime.",
    "Drawn from faith, observation, and the wisdom of community, it asks one question on every page: who are you becoming when no one is watching?",
  ],
  tags: ["#observe", "#restrain", "#flourish"],
};

try {
  await sql.query(DDL);
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ`;
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM orders;`;
  console.log(`✓ orders table ready (current rows: ${count})`);

  await sql.query(NEWSLETTER_DDL);
  const [{ subs }] =
    await sql`SELECT count(*)::int AS subs FROM newsletter_subscribers;`;
  console.log(`✓ newsletter_subscribers ready (current rows: ${subs})`);

  await sql.query(SITE_CONTENT_DDL);
  // Seed defaults only if no row exists yet — never clobber admin edits.
  await sql`
    INSERT INTO site_content (id, data)
    VALUES (1, ${JSON.stringify({ product: DEFAULT_PRODUCT })}::jsonb)
    ON CONFLICT (id) DO NOTHING
  `;
  const [{ seeded }] = await sql`SELECT (data ? 'product') AS seeded FROM site_content WHERE id = 1;`;
  console.log(`✓ site_content ready (product slice present: ${seeded})`);
} catch (err) {
  console.error("✗ Failed to initialize database:", err.message);
  process.exit(1);
}
