"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type CartCtx = {
  /** Number of copies of the book in the cart (single-product store). */
  qty: number;
  /** Whether localStorage has been read (avoids SSR/first-paint flicker). */
  ready: boolean;
  add: () => void;
  setQty: (n: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "wptf_cart_qty";
const MAX = 99;

const clamp = (n: number) => Math.max(0, Math.min(MAX, Math.floor(n) || 0));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [qty, setQtyState] = useState(0);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage after mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setQtyState(clamp(parseInt(raw, 10)));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  // Persist on change (once hydrated).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, String(qty));
    } catch {
      /* ignore */
    }
  }, [qty, ready]);

  const add = useCallback(() => setQtyState((q) => clamp(q + 1)), []);
  const setQty = useCallback((n: number) => setQtyState(clamp(n)), []);
  const clear = useCallback(() => setQtyState(0), []);

  return (
    <Ctx.Provider value={{ qty, ready, add, setQty, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
