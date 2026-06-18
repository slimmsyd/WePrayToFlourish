"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../cart/CartContext";

// Pricing logic (from BUILD-SPEC.md §3)
const PRICE = 24; // USD per copy
const SHIP_COST = 5;
const SHIP_FREE_AT = 40; // subtotal >= this -> free shipping

const fmt = (n: number) => "$" + n.toFixed(2);

const inputClass =
  "w-full rounded-[8px] border border-[rgba(26,23,20,0.22)] bg-paper px-[15px] py-[13px] font-body text-[16px] text-ink outline-none transition-colors focus:border-gold";
const labelClass =
  "flex flex-col gap-[7px] text-[13px] tracking-[0.02em] text-ink-soft";
const legendClass =
  "mb-[4px] p-0 font-display text-[13px] uppercase tracking-[0.22em] text-ink";

export default function Checkout() {
  const { qty, setQty, clear } = useCart();
  const [done, setDone] = useState(false);
  const [orderedQty, setOrderedQty] = useState(0);

  // Reaching checkout with an empty cart starts a single-copy order.
  useEffect(() => {
    if (!done && qty < 1) setQty(1);
  }, [done, qty, setQty]);

  const activeQty = done ? orderedQty : Math.max(1, qty);
  const subtotal = activeQty * PRICE;
  const shipping = subtotal >= SHIP_FREE_AT ? 0 : SHIP_COST;
  const total = subtotal + shipping;

  const inc = () => setQty(Math.min(Math.max(1, qty) + 1, 99));
  const dec = () => setQty(Math.max(Math.max(1, qty) - 1, 1));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: validate + charge via payment provider (Stripe etc.) before confirming.
    // Currently front-end only, per BUILD-SPEC.md §4–5.
    setOrderedQty(Math.max(1, qty));
    setDone(true);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-paper font-body text-ink antialiased">
      {/* HEADER */}
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

      {/* TITLE STRIP */}
      <div className="mx-auto flex max-w-[1180px] flex-col gap-[10px] px-[clamp(20px,4vw,56px)] pb-[clamp(20px,3vw,28px)] pt-[clamp(32px,5vw,56px)]">
        <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">
          Checkout
        </span>
        <h1 className="m-0 font-display text-[clamp(30px,4vw,52px)] font-normal leading-[1.0] tracking-[-0.02em]">
          Complete your order
        </h1>
      </div>

      {/* BODY GRID */}
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-[clamp(32px,5vw,72px)] px-[clamp(20px,4vw,56px)] pb-[clamp(60px,9vh,110px)] md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        {/* LEFT: form or confirmation */}
        {!done ? (
          <form
            onSubmit={onSubmit}
            className="order-1 flex flex-col gap-[clamp(28px,4vw,40px)]"
          >
            {/* 1 - Contact */}
            <fieldset className="m-0 flex flex-col gap-[16px] border-none p-0">
              <legend className={legendClass}>1 &middot; Contact</legend>
              <label className={labelClass}>
                Email address
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Full name
                <input
                  type="text"
                  required
                  placeholder="First and last name"
                  className={inputClass}
                />
              </label>
            </fieldset>

            {/* 2 - Shipping */}
            <fieldset className="m-0 flex flex-col gap-[16px] border-none p-0">
              <legend className={legendClass}>2 &middot; Shipping address</legend>
              <label className={labelClass}>
                Street address
                <input
                  type="text"
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
                    required
                    placeholder="City"
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  ZIP / Postal
                  <input
                    type="text"
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
                  required
                  placeholder="Country"
                  className={inputClass}
                />
              </label>
            </fieldset>

            {/* 3 - Payment */}
            <fieldset className="m-0 flex flex-col gap-[16px] border-none p-0">
              <legend className={legendClass}>3 &middot; Payment</legend>
              <label className={labelClass}>
                Card number
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="1234 1234 1234 1234"
                  className={inputClass}
                />
              </label>
              <div className="grid grid-cols-2 gap-[14px]">
                <label className={labelClass}>
                  Expiry
                  <input
                    type="text"
                    required
                    placeholder="MM / YY"
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  CVC
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="CVC"
                    className={inputClass}
                  />
                </label>
              </div>
            </fieldset>

            <button
              type="submit"
              className="cursor-pointer rounded-full border-none bg-dark px-[30px] py-[18px] font-display text-[16px] font-medium tracking-[0.02em] text-paper transition-colors hover:bg-black"
            >
              Pay {fmt(total)} &middot; Place order
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
              Secure encrypted checkout. You can cancel anytime before shipping.
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
              Thank you. Your order is in.
            </h2>
            <p className="m-0 max-w-[46ch] text-[17px] font-light leading-[1.65] text-ink-soft">
              A confirmation is on its way to your inbox. 52 Laws of You will ship
              shortly, and your free first chapter is included as a digital
              download.
            </p>
            <Link
              href="/"
              className="mt-[6px] border-b-[1.5px] border-gold pb-[3px] text-[15px] font-semibold text-ink transition-colors hover:text-gold"
            >
              Return to the site &rarr;
            </Link>
          </div>
        )}

        {/* RIGHT: order summary */}
        <aside className="order-2 flex flex-col gap-[24px] rounded-[6px] bg-panel p-[clamp(26px,3vw,36px)] md:sticky md:top-[24px]">
          <span className="font-display text-[12px] uppercase tracking-[0.28em] text-gold">
            Order summary
          </span>
          <div className="flex items-start gap-[18px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/book.png"
              alt="52 Laws of You"
              className="w-[88px] shrink-0 self-start object-contain"
            />
            <div className="flex flex-col gap-[6px]">
              <span className="font-display text-[19px] leading-[1.1] tracking-[-0.01em]">
                52 Laws of You
              </span>
              <span className="text-[13px] tracking-[0.04em] text-muted">
                Paperback &middot; by Yaddin
              </span>
              <span className="text-[13px] text-ink-soft">
                Includes free first chapter
              </span>
            </div>
          </div>

          {/* qty */}
          <div className="flex items-center justify-between pt-[4px]">
            <span className="text-[15px] text-ink-soft">Quantity</span>
            {!done ? (
              <div className="flex items-center overflow-hidden rounded-full border border-ink/20">
                <button
                  type="button"
                  onClick={dec}
                  aria-label="Decrease"
                  className="h-[38px] w-[38px] cursor-pointer border-none bg-transparent text-[20px] leading-none text-ink transition-colors hover:bg-ink/[0.06]"
                >
                  &minus;
                </button>
                <span className="min-w-[32px] text-center text-[16px] font-semibold">
                  {activeQty}
                </span>
                <button
                  type="button"
                  onClick={inc}
                  aria-label="Increase"
                  className="h-[38px] w-[38px] cursor-pointer border-none bg-transparent text-[20px] leading-none text-ink transition-colors hover:bg-ink/[0.06]"
                >
                  +
                </button>
              </div>
            ) : (
              <span className="text-[16px] font-semibold">{activeQty}</span>
            )}
          </div>

          <div className="h-px bg-ink/[0.12]" />

          <div className="flex flex-col gap-[11px] text-[15px] text-ink-soft">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : fmt(shipping)}</span>
            </div>
          </div>

          <div className="h-px bg-ink/[0.12]" />

          <div className="flex items-baseline justify-between">
            <span className="font-display text-[16px] tracking-[0.02em]">
              Total
            </span>
            <span className="font-display text-[26px] tracking-[-0.01em]">
              {fmt(total)}
            </span>
          </div>

          <div className="mt-[2px] flex items-center gap-[9px] text-[12.5px] tracking-[0.02em] text-muted">
            <span className="text-gold">&#10022;</span> Free worldwide shipping
            over $40
          </div>
        </aside>
      </div>
    </div>
  );
}
