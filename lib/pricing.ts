// Order pricing math. The SERVER uses this to compute the authoritative charge
// amount — the client only ever displays a preview. Never trust an amount sent
// from the browser. Pricing inputs come from the DB (lib/content.ts).

import type { CommerceContent, ProductContent } from "@/site.config";

export const MIN_QTY = 1;

export type CartLine = { productId: string; qty: number };

export type LineBreakdown = {
  productId: string;
  title: string;
  author: string;
  format: string;
  qty: number;
  unitPriceCents: number;
  lineSubtotalCents: number;
};

export type PriceBreakdown = {
  /** Sum of line quantities. */
  qty: number;
  lines: LineBreakdown[];
  subtotal: number; // dollars
  shipping: number; // dollars
  tax: number; // dollars
  total: number; // dollars
  amountInCents: number; // what Stripe charges
  currency: string;
};

export function clampQty(n: number, maxQty: number): number {
  const v = Math.floor(Number(n) || 0);
  return Math.max(MIN_QTY, Math.min(Math.max(MIN_QTY, maxQty), v));
}

function productMap(products: ProductContent[]): Map<string, ProductContent> {
  return new Map(products.map((p) => [p.id, p]));
}

/**
 * Compute the full price breakdown for a multi-product cart. Math is done in
 * integer cents; dollar fields are derived for display. Shipping/tax apply at
 * the order level from `commerce`.
 */
export function priceForCart(
  lines: CartLine[],
  products: ProductContent[],
  commerce: CommerceContent,
): PriceBreakdown {
  const catalog = productMap(products);
  const lineBreakdowns: LineBreakdown[] = [];
  let subtotalCents = 0;
  let totalQty = 0;

  for (const line of lines) {
    const product = catalog.get(line.productId);
    if (!product) continue;
    const qty = clampQty(line.qty, product.maxQty);
    const lineSubtotalCents = qty * product.priceCents;
    subtotalCents += lineSubtotalCents;
    totalQty += qty;
    lineBreakdowns.push({
      productId: product.id,
      title: product.title,
      author: product.author,
      format: product.format,
      qty,
      unitPriceCents: product.priceCents,
      lineSubtotalCents,
    });
  }

  if (lineBreakdowns.length === 0) {
    return {
      qty: 0,
      lines: [],
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      amountInCents: 0,
      currency: commerce.currency,
    };
  }

  const shippingCents =
    subtotalCents >= commerce.freeShipThresholdCents
      ? 0
      : commerce.shipFlatCents;
  const taxCents = Math.round(
    (subtotalCents + shippingCents) * commerce.taxRate,
  );
  const totalCents = subtotalCents + shippingCents + taxCents;

  return {
    qty: totalQty,
    lines: lineBreakdowns,
    subtotal: subtotalCents / 100,
    shipping: shippingCents / 100,
    tax: taxCents / 100,
    total: totalCents / 100,
    amountInCents: totalCents,
    currency: commerce.currency,
  };
}

/** Single-product shortcut — featured product, one line. */
export function priceFor(
  qtyInput: number,
  product: ProductContent,
  commerce: CommerceContent,
): PriceBreakdown {
  return priceForCart(
    [{ productId: product.id, qty: qtyInput }],
    [product],
    commerce,
  );
}