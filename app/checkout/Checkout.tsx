"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { useCart } from "../cart/CartContext";
import { getStripe } from "@/lib/stripe-client";
import { priceForCart, type CartLine } from "@/lib/pricing";
import { useSiteContent } from "@/lib/site-content";
import type { ProductContent, SiteContent } from "@/lib/content";

type CheckoutCopy = SiteContent["copy"]["checkout"];

const fmt = (n: number) => "$" + n.toFixed(2);

const inputClass =
  "w-full rounded-[8px] border border-[rgba(26,23,20,0.22)] bg-paper px-[15px] py-[13px] font-body text-[16px] text-ink outline-none transition-colors focus:border-gold";
const labelClass =
  "flex flex-col gap-[7px] text-[13px] tracking-[0.02em] text-ink-soft";
const legendClass =
  "mb-[4px] p-0 font-display text-[13px] uppercase tracking-[0.22em] text-ink";

const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#9c7b4d",
    colorBackground: "#f6f2ea",
    colorText: "#1a1714",
    colorTextSecondary: "#4a443c",
    colorDanger: "#b3261e",
    borderRadius: "8px",
    spacingUnit: "4px",
    fontSizeBase: "16px",
  },
  rules: {
    ".Input": { borderColor: "rgba(26,23,20,0.22)", padding: "13px 15px" },
    ".Input:focus": { borderColor: "#9c7b4d", boxShadow: "none" },
    ".Label": {
      textTransform: "none",
      color: "#4a443c",
      fontSize: "13px",
    },
  },
};

const stripePromise = getStripe();

function activeLines(
  cartLines: CartLine[],
  featured: ProductContent | null,
  done: boolean,
  orderedLines: CartLine[],
): CartLine[] {
  if (done && orderedLines.length > 0) return orderedLines;
  if (cartLines.length > 0) return cartLines;
  if (!featured) return [];
  return [{ productId: featured.id, qty: 1 }];
}

export default function Checkout() {
  const site = useSiteContent();
  const featured =
    site.products.find((p) => p.featured) ?? site.products[0] ?? null;
  const { lines: cartLines } = useCart();

  if (site.products.length === 0) {
    return (
      <div className="min-h-screen bg-paper px-[clamp(20px,4vw,56px)] py-[80px] font-body text-ink">
        <p className="mx-auto max-w-[50ch] text-[17px] leading-[1.6] text-ink-soft">
          No books are available for purchase yet. Check back soon.
        </p>
        <Link
          href="/"
          className="mx-auto mt-[20px] inline-block border-b-[1.5px] border-gold pb-[3px] text-[15px] font-semibold text-ink"
        >
          Return to the site &rarr;
        </Link>
      </div>
    );
  }
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const created = useRef(false);

  const initialLines = useMemo(
    () => activeLines(cartLines, featured, false, []),
    [cartLines, featured],
  );

  useEffect(() => {
    if (created.current) return;
    created.current = true;
    (async () => {
      try {
        const res = await fetch("/api/checkout/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: initialLines }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not start checkout");
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (err) {
        setInitError(
          err instanceof Error ? err.message : "Could not start checkout",
        );
      }
    })();
  }, [initialLines]);

  return (
    <div className="min-h-screen bg-paper font-body text-ink antialiased">
      <div className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-5 px-[clamp(20px,4vw,56px)] py-[13px]">
          <Link href="/" className="flex shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="We Pray to Flourish"
              className="block h-[clamp(32px,3.6vw,46px)] w-auto"
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-[8px] font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-ink transition-colors hover:text-gold"
          >
            <span className="text-[15px]">&larr;</span> Back to site
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1180px] flex-col gap-[10px] px-[clamp(20px,4vw,56px)] pb-[clamp(20px,3vw,28px)] pt-[clamp(32px,5vw,56px)]">
        <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">
          Checkout
        </span>
        <h1 className="m-0 font-display text-[clamp(30px,4vw,52px)] font-normal leading-[1.0] tracking-[-0.02em]">
          {site.copy.checkout.pageTitle}
        </h1>
      </div>

      {initError ? (
        <div className="mx-auto max-w-[1180px] px-[clamp(20px,4vw,56px)] pb-[80px]">
          <p className="rounded-[8px] border border-[#b3261e]/30 bg-[#b3261e]/[0.06] px-[18px] py-[16px] text-[15px] text-[#8a1d17]">
            {initError}
          </p>
        </div>
      ) : !clientSecret ? (
        <div className="mx-auto max-w-[1180px] px-[clamp(20px,4vw,56px)] pb-[120px] pt-[40px]">
          <p className="text-[15px] text-muted">Preparing secure checkout…</p>
        </div>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
          <CheckoutBody
            paymentIntentId={paymentIntentId!}
            products={site.products}
            commerce={site.commerce}
            featured={featured}
            checkout={site.copy.checkout}
          />
        </Elements>
      )}
    </div>
  );
}

function CheckoutBody({
  paymentIntentId,
  products,
  commerce,
  featured,
  checkout,
}: {
  paymentIntentId: string;
  products: ProductContent[];
  commerce: SiteContent["commerce"];
  featured: ProductContent | null;
  checkout: CheckoutCopy;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { lines: cartLines, setQty, clear } = useCart();

  const [done, setDone] = useState(false);
  const [orderedLines, setOrderedLines] = useState<CartLine[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const lines = activeLines(cartLines, featured, done, orderedLines);
  const price = priceForCart(lines, products, commerce);
  const freeShipAt = commerce.freeShipThresholdCents / 100;

  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const changeQty = (productId: string, delta: number) => {
    const line = lines.find((l) => l.productId === productId);
    const product = productById.get(productId);
    if (!product || !line) return;
    const next = Math.max(1, Math.min(product.maxQty, line.qty + delta));
    setQty(productId, next);
  };

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!stripe || !elements || submitting) return;

      setSubmitting(true);
      setPayError(null);

      const form = e.currentTarget;
      const fd = new FormData(form);
      const customer = {
        email: String(fd.get("email") || ""),
        name: String(fd.get("name") || ""),
        addressLine: String(fd.get("address") || ""),
        city: String(fd.get("city") || ""),
        postalCode: String(fd.get("postal") || ""),
        country: String(fd.get("country") || ""),
      };
      const chosenLines = activeLines(cartLines, featured, false, []);

      try {
        const intentRes = await fetch("/api/checkout/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lines: chosenLines,
            paymentIntentId,
            customer,
          }),
        });
        const intentData = await intentRes.json();
        if (!intentRes.ok)
          throw new Error(intentData.error || "Could not update order");

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout`,
            receipt_email: customer.email || undefined,
          },
          redirect: "if_required",
        });

        if (error) {
          setPayError(error.message || "Payment could not be completed.");
          setSubmitting(false);
          return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          await fetch("/api/checkout/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
          }).catch(() => {});

          form.reset();
          setOrderedLines(chosenLines);
          setDone(true);
          clear();
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          setPayError(
            `Payment status: ${paymentIntent?.status ?? "unknown"}. Please try again.`,
          );
        }
      } catch (err) {
        setPayError(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [stripe, elements, submitting, cartLines, featured, paymentIntentId, clear],
  );

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-[clamp(32px,5vw,72px)] px-[clamp(20px,4vw,56px)] pb-[clamp(60px,9vh,110px)] md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
      {!done ? (
        <form
          onSubmit={onSubmit}
          className="order-1 flex flex-col gap-[clamp(28px,4vw,40px)]"
        >
          <fieldset className="m-0 flex flex-col gap-[16px] border-none p-0">
            <legend className={legendClass}>1 &middot; Contact</legend>
            <label className={labelClass}>
              Email address
              <input
                type="email"
                name="email"
                required
                placeholder="you@email.com"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Full name
              <input
                type="text"
                name="name"
                required
                placeholder="First and last name"
                className={inputClass}
              />
            </label>
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-[16px] border-none p-0">
            <legend className={legendClass}>2 &middot; Shipping address</legend>
            <label className={labelClass}>
              Street address
              <input
                type="text"
                name="address"
                required
                placeholder="123 Main Street"
                className={inputClass}
              />
            </label>
            <div className="grid grid-cols-2 gap-[14px]">
              <label className={labelClass}>
                City
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="City"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                ZIP / Postal
                <input
                  type="text"
                  name="postal"
                  required
                  placeholder="00000"
                  className={inputClass}
                />
              </label>
            </div>
            <label className={labelClass}>
              Country
              <input
                type="text"
                name="country"
                required
                placeholder="Country"
                className={inputClass}
              />
            </label>
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-[16px] border-none p-0">
            <legend className={legendClass}>3 &middot; Payment</legend>
            <PaymentElement options={{ layout: "tabs" }} />
          </fieldset>

          {payError && (
            <p className="-mt-[8px] rounded-[8px] border border-[#b3261e]/30 bg-[#b3261e]/[0.06] px-[15px] py-[12px] text-[14px] text-[#8a1d17]">
              {payError}
            </p>
          )}

          <button
            type="submit"
            disabled={!stripe || submitting}
            className="cursor-pointer rounded-full border-none bg-dark px-[30px] py-[18px] font-display text-[16px] font-medium tracking-[0.02em] text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Processing…" : `Pay ${fmt(price.total)} · Place order`}
          </button>
          <span className="-mt-[12px] flex items-center gap-[8px] text-[13px] text-muted">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            {checkout.securityNote}
          </span>
        </form>
      ) : (
        <div className="order-1 flex flex-col items-start gap-[18px] py-[clamp(32px,5vw,52px)]">
          <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-dark">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D8B27C"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="m-0 font-display text-[clamp(28px,3.4vw,42px)] font-normal leading-[1.05] tracking-[-0.02em]">
            {checkout.successTitle}
          </h2>
          <p className="m-0 max-w-[46ch] text-[17px] font-light leading-[1.65] text-ink-soft">
            {checkout.successBody}
          </p>
          <Link
            href="/"
            className="mt-[6px] border-b-[1.5px] border-gold pb-[3px] text-[15px] font-semibold text-ink transition-colors hover:text-gold"
          >
            Return to the site &rarr;
          </Link>
        </div>
      )}

      <aside className="order-2 flex flex-col gap-[24px] rounded-[6px] bg-panel p-[clamp(26px,3vw,36px)] md:sticky md:top-[24px]">
        <span className="font-display text-[12px] uppercase tracking-[0.28em] text-gold">
          Order summary
        </span>

        <div className="flex flex-col gap-[20px]">
          {price.lines.map((line) => {
            const product = productById.get(line.productId);
            if (!product) return null;
            return (
              <div key={line.productId} className="flex items-start gap-[18px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.coverImage}
                  alt={product.title}
                  className="w-[72px] shrink-0 self-start object-contain"
                />
                <div className="flex flex-1 flex-col gap-[8px]">
                  <div className="flex flex-col gap-[4px]">
                    <span className="font-display text-[17px] leading-[1.1] tracking-[-0.01em]">
                      {product.title}
                    </span>
                    <span className="text-[12px] tracking-[0.04em] text-muted">
                      {product.format} &middot; by {product.author}
                    </span>
                    <span className="text-[12px] text-ink-soft">
                      {checkout.summaryItemNote}
                    </span>
                  </div>
                  {!done ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-ink-soft">Qty</span>
                      <div className="flex items-center overflow-hidden rounded-full border border-ink/20">
                        <button
                          type="button"
                          onClick={() => changeQty(line.productId, -1)}
                          aria-label={`Decrease ${product.title}`}
                          className="h-[34px] w-[34px] cursor-pointer border-none bg-transparent text-[18px] leading-none text-ink transition-colors hover:bg-ink/[0.06]"
                        >
                          &minus;
                        </button>
                        <span className="min-w-[28px] text-center text-[15px] font-semibold">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQty(line.productId, 1)}
                          aria-label={`Increase ${product.title}`}
                          className="h-[34px] w-[34px] cursor-pointer border-none bg-transparent text-[18px] leading-none text-ink transition-colors hover:bg-ink/[0.06]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[13px] text-ink-soft">
                      Qty {line.qty}
                    </span>
                  )}
                  <span className="text-[14px] font-medium text-ink">
                    {fmt(line.lineSubtotalCents / 100)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-px bg-ink/[0.12]" />

        <div className="flex flex-col gap-[11px] text-[15px] text-ink-soft">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{fmt(price.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{price.shipping === 0 ? "Free" : fmt(price.shipping)}</span>
          </div>
          {price.tax > 0 && (
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{fmt(price.tax)}</span>
            </div>
          )}
        </div>

        <div className="h-px bg-ink/[0.12]" />

        <div className="flex items-baseline justify-between">
          <span className="font-display text-[16px] tracking-[0.02em]">Total</span>
          <span className="font-display text-[26px] tracking-[-0.01em]">
            {fmt(price.total)}
          </span>
        </div>

        <div className="mt-[2px] flex items-center gap-[9px] text-[12.5px] tracking-[0.02em] text-muted">
          <span className="text-gold">&#10022;</span> {checkout.shippingNote}{" "}
          {fmt(freeShipAt)}
        </div>
      </aside>
    </div>
  );
}