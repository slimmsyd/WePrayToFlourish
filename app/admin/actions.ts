"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE, signSession, verifyPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-server";
import {
  DEFAULT_PRODUCT,
  updateProductContent,
  type ProductContent,
} from "@/lib/content";

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

// ── Product editor ────────────────────────────────────────────

const dollarsToCents = (v: FormDataEntryValue | null): number =>
  Math.round(parseFloat(String(v ?? "")) * 100);

const intOf = (v: FormDataEntryValue | null): number =>
  Math.floor(Number(String(v ?? "")));

export async function saveProductAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  await requireAdmin(); // defense in depth — never rely on proxy alone

  const str = (k: string) => String(formData.get(k) ?? "").trim();

  const priceCents = dollarsToCents(formData.get("price"));
  const shipFlatCents = dollarsToCents(formData.get("shipFlat"));
  const freeShipThresholdCents = dollarsToCents(formData.get("freeShipThreshold"));
  const taxRate = (parseFloat(str("taxRatePct")) || 0) / 100;
  const maxQty = intOf(formData.get("maxQty"));

  // Validation
  const title = str("title");
  const author = str("author");
  if (!title) return { error: "Title is required." };
  if (!author) return { error: "Author is required." };
  for (const [label, n] of [
    ["Price", priceCents],
    ["Shipping", shipFlatCents],
    ["Free-shipping threshold", freeShipThresholdCents],
  ] as const) {
    if (!Number.isFinite(n) || n < 0) return { error: `${label} must be a number ≥ 0.` };
  }
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 1) {
    return { error: "Tax rate must be between 0 and 100%." };
  }
  if (!Number.isFinite(maxQty) || maxQty < 1) return { error: "Max quantity must be ≥ 1." };

  const longDescription = str("longDescription")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const tags = str("tags")
    .split(/[,\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const next: ProductContent = {
    title,
    author,
    format: str("format") || DEFAULT_PRODUCT.format,
    priceCents,
    currency: (str("currency") || DEFAULT_PRODUCT.currency).toLowerCase(),
    shipFlatCents,
    freeShipThresholdCents,
    taxRate,
    maxQty,
    coverImage: str("coverImage") || DEFAULT_PRODUCT.coverImage,
    coverAlt: str("coverAlt") || title,
    hoverVideo: str("hoverVideo"),
    tagline: str("tagline") || title,
    shortDescription: str("shortDescription"),
    longDescription,
    tags,
  };

  try {
    await updateProductContent(next);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save." };
  }

  // Refresh any statically-rendered public pages (the intent route + admin read
  // the DB fresh, so they need no invalidation).
  revalidatePath("/");
  revalidatePath("/checkout");
  return { ok: true };
}
