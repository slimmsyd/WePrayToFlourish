import "server-only";
import { cache } from "react";
import site, {
  PRODUCT_TEMPLATE,
  type SiteConfig,
  type ProductContent,
  type CommerceContent,
} from "@/site.config";
import { sql } from "./db";

export { PRODUCT_TEMPLATE };

// ─────────────────────────────────────────────────────────────
// Site content model. The editable content IS the full SiteConfig. `site`
// (from site.config.ts) is the default/seed; the DB holds the edited version,
// stored as one JSONB document in `site_content` (id = 1). Prices are in CENTS
// — the server (the Stripe intent route, via lib/pricing.ts) is the only
// pricing authority.
// ─────────────────────────────────────────────────────────────

export type SiteContent = SiteConfig;
export type { ProductContent, CommerceContent };

/** Default content (seed + fallback + the save-action shape validator). */
export { site as defaultContent };

type Json = Record<string, unknown>;

/** Legacy single-product shape stored in older DB rows. */
type LegacyProduct = ProductContent & {
  currency?: string;
  shipFlatCents?: number;
  freeShipThresholdCents?: number;
  taxRate?: number;
};

/**
 * Deep-merge a stored override doc over the defaults.
 * - objects: recurse (missing keys fall back to defaults)
 * - arrays: replace wholesale (lists are user-owned)
 * - scalars: the stored value wins when present
 */
function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base) || Array.isArray(override)) return override as T;
  if (typeof base === "object" && typeof override === "object") {
    const out: Json = { ...(base as Json) };
    for (const [k, v] of Object.entries(override as Json)) {
      out[k] = k in (base as Json) ? deepMerge((base as Json)[k], v) : v;
    }
    return out as T;
  }
  return override as T;
}

/** Migrate legacy `product` object → `products[]` + `commerce`. */
function normalizeSiteContent(
  merged: SiteContent,
  stored?: unknown,
): SiteContent {
  const raw = (stored ?? {}) as Json;
  let next = merged;

  // DB still has the old singular `product` key.
  if (raw.product && typeof raw.product === "object" && !Array.isArray(raw.products)) {
    const legacy = raw.product as LegacyProduct;
    const commerce: CommerceContent = {
      currency: String(legacy.currency ?? next.commerce?.currency ?? "usd"),
      shipFlatCents: Number(
        legacy.shipFlatCents ?? next.commerce?.shipFlatCents ?? 500,
      ),
      freeShipThresholdCents: Number(
        legacy.freeShipThresholdCents ??
          next.commerce?.freeShipThresholdCents ??
          4000,
      ),
      taxRate: Number(legacy.taxRate ?? next.commerce?.taxRate ?? 0),
    };
    const {
      currency: _c,
      shipFlatCents: _s,
      freeShipThresholdCents: _f,
      taxRate: _t,
      ...fields
    } = legacy;
    const product: ProductContent = {
      id: String(fields.id ?? "52-laws-of-you"),
      featured: fields.featured ?? true,
      title: String(fields.title ?? ""),
      author: String(fields.author ?? ""),
      format: String(fields.format ?? ""),
      priceCents: Number(fields.priceCents ?? 0),
      maxQty: Number(fields.maxQty ?? 99),
      coverImage: String(fields.coverImage ?? ""),
      coverAlt: String(fields.coverAlt ?? ""),
      hoverVideo: String(fields.hoverVideo ?? ""),
      tagline: String(fields.tagline ?? ""),
      shortDescription: String(fields.shortDescription ?? ""),
      longDescription: Array.isArray(fields.longDescription)
        ? fields.longDescription.map(String)
        : [],
      tags: Array.isArray(fields.tags) ? fields.tags.map(String) : [],
    };
    next = { ...next, commerce, products: [product] };
  }

  if (!next.products) {
    next = { ...next, products: [] };
  }
  if (!next.commerce) {
    next = { ...next, commerce: site.commerce };
  }

  if (next.products.length === 0) {
    return next;
  }

  const products = next.products.map((p, i) => ({
    ...p,
    id: p.id?.trim() || `product-${i + 1}`,
  }));
  const featuredIdx = products.findIndex((p) => p.featured);
  const normalizedProducts = products.map((p, i) => ({
    ...p,
    featured: featuredIdx >= 0 ? i === featuredIdx : i === 0,
  }));

  return { ...next, products: normalizedProducts };
}

/**
 * The live site content — read fresh from the DB (merged over defaults) so the
 * pricing authority and admin are never stale. Wrapped in React cache() so the
 * many server components in one render share a single DB read (per-request only,
 * NOT cross-request, so no staleness). Falls back to defaults on any error.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  try {
    const rows = await sql`SELECT data FROM site_content WHERE id = 1`;
    const stored = rows[0]?.data as Partial<SiteConfig> | undefined;
    const merged = stored ? deepMerge(site, stored) : site;
    return normalizeSiteContent(merged, stored);
  } catch {
    return site;
  }
});

/** The featured product — hero, newsletter, and legacy single-SKU fallbacks. */
export async function getFeaturedProduct(): Promise<ProductContent | null> {
  const { products } = await getSiteContent();
  if (products.length === 0) return null;
  return products.find((p) => p.featured) ?? products[0];
}

/** Lookup a product by stable id (cart / checkout). */
export async function getProductById(id: string): Promise<ProductContent | null> {
  const { products } = await getSiteContent();
  return products.find((p) => p.id === id) ?? null;
}

/** Store-wide commerce settings (shipping, tax, currency). */
export async function getCommerce(): Promise<CommerceContent> {
  return (await getSiteContent()).commerce;
}

/** @deprecated Use getFeaturedProduct or products from getSiteContent. */
export async function getProductContent(): Promise<ProductContent | null> {
  return getFeaturedProduct();
}

/** Persist the full edited config (admin only). */
export async function updateSiteContent(next: SiteContent): Promise<void> {
  const json = JSON.stringify(next);
  await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES (1, ${json}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET data = ${json}::jsonb, updated_at = now()
  `;
}

/** Last time the content was edited (for the dashboard). */
export async function getContentUpdatedAt(): Promise<Date | null> {
  const rows = await sql`SELECT updated_at FROM site_content WHERE id = 1`;
  return rows[0]?.updated_at ? new Date(rows[0].updated_at as string) : null;
}