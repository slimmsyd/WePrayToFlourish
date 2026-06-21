import "server-only";
import { cache } from "react";
import site, { type SiteConfig, type ProductContent } from "@/site.config";
import { sql } from "./db";

// ─────────────────────────────────────────────────────────────
// Site content model. The editable content IS the full SiteConfig. `site`
// (from site.config.ts) is the default/seed; the DB holds the edited version,
// stored as one JSONB document in `site_content` (id = 1). Prices are in CENTS
// — the server (the Stripe intent route, via lib/pricing.ts) is the only
// pricing authority.
// ─────────────────────────────────────────────────────────────

export type SiteContent = SiteConfig;
export type { ProductContent };

/** Default content (seed + fallback + the save-action shape validator). */
export { site as defaultContent };

type Json = Record<string, unknown>;

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
    return stored ? deepMerge(site, stored) : site;
  } catch {
    return site;
  }
});

/** Just the product slice — used by the Stripe pricing path (lib/pricing.ts). */
export async function getProductContent(): Promise<ProductContent> {
  return (await getSiteContent()).product;
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

/** Last time the content was edited (for the dashboard). Null if never. */
export async function getContentUpdatedAt(): Promise<Date | null> {
  const rows = await sql`SELECT updated_at FROM site_content WHERE id = 1`;
  return rows[0]?.updated_at ? new Date(rows[0].updated_at as string) : null;
}
