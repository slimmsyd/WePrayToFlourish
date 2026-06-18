"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "../cart/CartContext";

export default function AddToCartButton() {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onClick = () => {
    add();
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      className="mt-[26px] inline-flex cursor-pointer items-center justify-center rounded-full bg-[#6a6056] px-[40px] py-[13px] text-[13px] font-medium tracking-[0.04em] text-paper transition-colors hover:bg-ink-soft"
    >
      {added ? "Added to cart ✓" : "Read the first law"}
    </button>
  );
}
