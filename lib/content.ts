import "server-only";
import { sql } from "./db";

// ─────────────────────────────────────────────────────────────
// Site content model.
//
// Mirrors the `product` slice of book-landing-template/site.config.ts so this
// stays template-compatible. Prices are in CENTS — the server (the Stripe
// intent route, via lib/pricing.ts) is the only pricing authority.
//
// Stored as a single JSONB document in the `site_content` table (one row,
// id = 1). Today it holds only `{ product }`; sibling slices (hero, about, …)
// can be added later without a migration.
// ─────────────────────────────────────────────────────────────

export type ProductContent = {
  title: string;
  author: string;
  format: string; // e.g. "Paperback"
  priceCents: number; // price per unit, smallest currency unit
  currency: string; // ISO, lowercase for Stripe (e.g. "usd")
  shipFlatCents: number; // flat shipping fee; 0 for digital
  freeShipThresholdCents: number; // subtotal >= this -> free shipping
  taxRate: number; // 0..1; server pricing authority needs it
  maxQty: number; // hard cap per order
  coverImage: string; // still cover in /public
  coverAlt: string;
  hoverVideo: string; // optional preview video in /public ("" = none)
  tagline: string; // pill text on the landing page
  shortDescription: string; // hero sub paragraph
  longDescription: string[]; // about-the-book body paragraphs
  tags: string[]; // hashtag-style chips
};

export type SiteContent = {
  product: ProductContent;
  // future: hero?, aboutBook?, aboutAuthor?, …
};

// Seed/fallback defaults — extracted verbatim from the original hardcoded
// values (Hero.tsx, AboutBook.tsx, BookHoverMedia.tsx, Checkout.tsx, pricing.ts).
// KEEP IN SYNC with the seed literal in scripts/db-init.mjs (that file is .mjs
// and cannot import this TS module).
export const DEFAULT_PRODUCT: ProductContent = {
  title: "52 Laws of You",
  author: "Yaddin",
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
    "52 Laws of You is the book Yaddin has ushered in: a weekly practice in becoming, for anyone learning to speak less, notice more, and flourish.",
  longDescription: [
    "52 Laws of You is a year-long practice in self-mastery. Each week offers a single law to read, sit with, and live. Small enough to begin today, deep enough to return to for a lifetime.",
    "Drawn from faith, observation, and the wisdom of community, it asks one question on every page: who are you becoming when no one is watching?",
  ],
  tags: ["#observe", "#restrain", "#flourish"],
};

/**
 * The product content for the public site + pricing — read fresh from the DB
 * on every call so the pricing authority (the Stripe intent route) and the
 * admin editor are never stale. Always merged over DEFAULT_PRODUCT, so a
 * missing row or a newly-added field degrades gracefully. Public marketing
 * pages that statically render are refreshed via revalidatePath() on save.
 */
export async function getProductContent(): Promise<ProductContent> {
  let stored: Partial<ProductContent> | null = null;
  try {
    const rows = await sql`SELECT data FROM site_content WHERE id = 1`;
    const data = rows[0]?.data as { product?: Partial<ProductContent> } | undefined;
    stored = data?.product ?? null;
  } catch {
    stored = null;
  }
  return { ...DEFAULT_PRODUCT, ...(stored ?? {}) };
}

/**
 * Persist the product slice. JSONB concat (`||`) replaces only the `product`
 * key, leaving any future sibling slices intact. The caller (the Server Action)
 * is responsible for revalidateTag("site-content") afterwards.
 */
export async function updateProductContent(next: ProductContent): Promise<void> {
  const slice = JSON.stringify({ product: next });
  await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES (1, ${slice}::jsonb, now())
    ON CONFLICT (id) DO UPDATE
      SET data = site_content.data || ${slice}::jsonb,
          updated_at = now()
  `;
}

/** Last time the content was edited (for the dashboard). Null if never. */
export async function getContentUpdatedAt(): Promise<Date | null> {
  const rows = await sql`SELECT updated_at FROM site_content WHERE id = 1`;
  return rows[0]?.updated_at ? new Date(rows[0].updated_at as string) : null;
}
