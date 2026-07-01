"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE, signSession, verifyPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-server";
import { PRODUCT_TEMPLATE } from "@/site.config";
import { defaultContent, updateSiteContent, type SiteContent } from "@/lib/content";

export type LoginState = { error?: string };
export type SaveState = { ok?: boolean; error?: string };

// ── Auth ──────────────────────────────────────────────────────

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!password || !(await verifyPassword(password))) {
    return { error: "Incorrect password." };
  }
  (await cookies()).set(SESSION_COOKIE, await signSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ── Content editor ────────────────────────────────────────────

/**
 * Validate a submitted draft against the default content's SHAPE, then persist.
 * Walks `defaultContent`; every leaf must keep its type (numbers finite; *Cents
 * and maxQty ≥ 0 / maxQty ≥ 1; arrays stay arrays). Missing keys fall back to
 * the default. This keeps the generic editor from corrupting the schema.
 */
function validateShape(base: unknown, value: unknown, path: string[]): unknown {
  if (Array.isArray(base)) {
    if (!Array.isArray(value)) throw new Error(`${path.join(".")} must be a list`);
    const sample =
      base[0] ??
      (path[path.length - 1] === "products" ? PRODUCT_TEMPLATE : undefined);
    return value.map((v, i) =>
      sample !== undefined && typeof sample === "object" && sample !== null
        ? validateShape(sample, v, [...path, String(i)])
        : validateShape(typeof sample === "number" ? 0 : "", v, [...path, String(i)]),
    );
  }
  if (base !== null && typeof base === "object") {
    const out: Record<string, unknown> = {};
    const v = (value ?? {}) as Record<string, unknown>;
    for (const [k, bv] of Object.entries(base as Record<string, unknown>)) {
      out[k] = k in v ? validateShape(bv, v[k], [...path, k]) : bv;
    }
    return out;
  }
  if (typeof base === "number") {
    const n = Number(value);
    if (!Number.isFinite(n)) throw new Error(`${path.join(".")} must be a number`);
    const key = path[path.length - 1] ?? "";
    if ((key.endsWith("Cents") || key === "maxQty") && n < 0)
      throw new Error(`${path.join(".")} must be ≥ 0`);
    if (key === "maxQty" && n < 1) throw new Error("maxQty must be ≥ 1");
    return key.endsWith("Cents") || key === "maxQty" ? Math.round(n) : n;
  }
  if (typeof base === "boolean") return Boolean(value);
  const str = value == null ? "" : String(value);
  // Currency feeds Stripe — keep it lowercase + trimmed.
  return path[path.length - 1] === "currency" ? str.toLowerCase().trim() : str;
}

export async function saveContentAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  await requireAdmin(); // defense in depth — Server Actions are POST-reachable

  let draft: unknown;
  try {
    draft = JSON.parse(String(formData.get("draft") ?? ""));
  } catch {
    return { error: "Could not read the form data." };
  }

  let validated: SiteContent;
  try {
    validated = validateShape(defaultContent, draft, []) as SiteContent;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid content." };
  }

  if (!validated.products?.length) {
    return { error: "At least one product is required." };
  }

  const ids = validated.products.map((p) => p.id?.trim()).filter(Boolean);
  if (ids.length !== validated.products.length) {
    return { error: "Every product needs a unique id (e.g. 52-laws-of-you)." };
  }
  if (new Set(ids).size !== ids.length) {
    return { error: "Product ids must be unique." };
  }

  const featuredCount = validated.products.filter((p) => p.featured).length;
  if (featuredCount !== 1) {
    const products = validated.products.map((p, i) => ({
      ...p,
      featured: featuredCount === 0 ? i === 0 : p.featured,
    }));
    if (featuredCount > 1) {
      let kept = false;
      validated = {
        ...validated,
        products: products.map((p) => {
          if (p.featured && !kept) {
            kept = true;
            return p;
          }
          return { ...p, featured: false };
        }),
      };
    } else {
      validated = { ...validated, products };
    }
  }

  try {
    await updateSiteContent(validated);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save." };
  }

  // Refresh the statically-rendered public pages (intent route + admin read fresh).
  revalidatePath("/");
  revalidatePath("/checkout");
  return { ok: true };
}
