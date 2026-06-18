"use client";

import Link from "next/link";
import { useCart } from "../cart/CartContext";

export default function CartButton() {
  const { qty, ready } = useCart();
  const hasItems = ready && qty > 0;
  // Empty cart -> book section; cart with items -> checkout.
  const href = hasItems ? "/checkout" : "/#book";

  return (
    <Link
      href={href}
      aria-label={hasItems ? `Cart, ${qty} item${qty > 1 ? "s" : ""}` : "Cart"}
      className="relative inline-flex text-ink transition-colors hover:text-gold"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path d="M2 3h2.2l2.3 12.2a1.2 1.2 0 0 0 1.2 1h8.9a1.2 1.2 0 0 0 1.2-.95L21 7.5H5.2" />
      </svg>
      {hasItems && (
        <span className="absolute -right-[7px] -top-[6px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-gold px-[3px] font-display text-[9px] font-semibold leading-none text-paper">
          {qty}
        </span>
      )}
    </Link>
  );
}
