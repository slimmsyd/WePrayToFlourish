"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/lib/pricing";

type CartCtx = {
  lines: CartLine[];
  /** Sum of all line quantities. */
  itemCount: number;
  /** Whether localStorage has been read (avoids SSR/first-paint flicker). */
  ready: boolean;
  add: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "wptf_cart_lines";
const LEGACY_KEY = "wptf_cart_qty";
const MAX = 99;

const clamp = (n: number) => Math.max(0, Math.min(MAX, Math.floor(n) || 0));

function parseStored(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is CartLine =>
          l &&
          typeof l === "object" &&
          typeof (l as CartLine).productId === "string" &&
          typeof (l as CartLine).qty === "number",
      )
      .map((l) => ({
        productId: l.productId,
        qty: clamp(l.qty),
      }))
      .filter((l) => l.qty > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      let stored = parseStored(localStorage.getItem(KEY));
      if (stored.length === 0) {
        const legacyQty = parseInt(localStorage.getItem(LEGACY_KEY) ?? "", 10);
        if (Number.isFinite(legacyQty) && legacyQty > 0) {
          stored = [{ productId: "52-laws-of-you", qty: clamp(legacyQty) }];
        }
      }
      setLines(stored);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      if (lines.length === 0) {
        localStorage.removeItem(KEY);
      } else {
        localStorage.setItem(KEY, JSON.stringify(lines));
      }
    } catch {
      /* ignore */
    }
  }, [lines, ready]);

  const add = useCallback((productId: string) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === productId
            ? { ...l, qty: clamp(l.qty + 1) }
            : l,
        );
      }
      return [...prev, { productId, qty: 1 }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    const n = clamp(qty);
    setLines((prev) => {
      if (n === 0) return prev.filter((l) => l.productId !== productId);
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === productId ? { ...l, qty: n } : l,
        );
      }
      return [...prev, { productId, qty: n }];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines],
  );

  return (
    <Ctx.Provider
      value={{ lines, itemCount, ready, add, setQty, remove, clear }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}