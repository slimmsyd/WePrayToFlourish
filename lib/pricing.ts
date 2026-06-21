// Order pricing math. The SERVER uses this to compute the authoritative charge
// amount — the client only ever displays a preview. Never trust an amount sent
// from the browser. Pricing inputs now come from the DB (lib/content.ts), not
// module constants, so the client (CRM) can change them.

export const MIN_QTY = 1;

/** Pricing inputs, sourced from the editable product content (cents). */
export type Pricing = {
  priceCents: number;
  shipFlatCents: number;
  freeShipThresholdCents: number;
  taxRate: number; // 0..1
  maxQty: number;
  currency: string;
};

export type PriceBreakdown = {
  qty: number;
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

/**
 * Compute the full price breakdown for a quantity. Math is done in integer
 * cents to avoid floating-point drift; dollar fields are derived for display.
 * Used by the server (charge authority) and the client (preview).
 */
export function priceFor(qtyInput: number, pricing: Pricing): PriceBreakdown {
  const qty = clampQty(qtyInput, pricing.maxQty);
  const subtotalCents = qty * pricing.priceCents;
  const shippingCents =
    subtotalCents >= pricing.freeShipThresholdCents ? 0 : pricing.shipFlatCents;
  const taxCents = Math.round((subtotalCents + shippingCents) * pricing.taxRate);
  const totalCents = subtotalCents + shippingCents + taxCents;
  return {
    qty,
    subtotal: subtotalCents / 100,
    shipping: shippingCents / 100,
    tax: taxCents / 100,
    total: totalCents / 100,
    amountInCents: totalCents,
    currency: pricing.currency,
  };
}

/** Pull the pricing inputs out of a product content object. */
export function pricingFrom(p: Pricing): Pricing {
  return {
    priceCents: p.priceCents,
    shipFlatCents: p.shipFlatCents,
    freeShipThresholdCents: p.freeShipThresholdCents,
    taxRate: p.taxRate,
    maxQty: p.maxQty,
    currency: p.currency,
  };
}
