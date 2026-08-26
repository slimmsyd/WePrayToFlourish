"use client";

import { useRef, useState } from "react";
import type { ProductContent } from "@/lib/content";
import { PRODUCT_TEMPLATE } from "@/site.config";
import type { Path } from "./editor-schema";
import { FieldEditor, type Assets } from "./FieldEditor";

function ProductCard({
  product,
  index,
  path,
  onChange,
  onRemove,
  assets,
}: {
  product: ProductContent;
  index: number;
  path: Path;
  onChange: (path: Path, value: unknown) => void;
  onRemove: (index: number) => void;
  assets: Assets;
}) {
  const [confirming, setConfirming] = useState(false);
  const [expanded, setExpanded] = useState(index === 0);
  const cardRef = useRef<HTMLDivElement>(null);

  const isExternal = product.purchaseType === "external";
  const title = product.title || `Product ${index + 1}`;

  return (
    <div
      ref={cardRef}
      className="overflow-hidden rounded-[12px] border border-ink/10 bg-panel/30"
    >
      {/* Card header — always visible */}
      <div className="flex items-center gap-[12px] px-[16px] py-[14px]">
        <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-ink/10 bg-paper">
          {product.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.coverImage} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-muted">—</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <div className="flex items-center gap-[8px]">
            <span className="truncate font-display text-[15px] font-medium text-ink">
              {title}
            </span>
            {product.featured && (
              <span className="shrink-0 rounded-full bg-gold/15 px-[8px] py-[2px] text-[10px] uppercase tracking-[0.08em] text-gold">
                Featured
              </span>
            )}
            {isExternal && (
              <span className="shrink-0 rounded-full bg-ink/10 px-[8px] py-[2px] text-[10px] uppercase tracking-[0.08em] text-ink-soft">
                External
              </span>
            )}
          </div>
          <span className="text-[12px] text-muted">
            {isExternal
              ? product.externalCtaLabel || "External link"
              : `$${(product.priceCents / 100).toFixed(2)} · ${product.format}`}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-[6px]">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="cursor-pointer rounded-[6px] border border-ink/15 px-[12px] py-[6px] text-[12px] text-ink-soft transition-colors duration-200 hover:bg-ink/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
          >
            {expanded ? "Collapse" : "Edit"}
          </button>
          {confirming ? (
            <div className="flex items-center gap-[6px]">
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="cursor-pointer rounded-[6px] border border-[#b3261e]/40 bg-[#b3261e]/[0.06] px-[10px] py-[6px] text-[12px] font-medium text-[#8a1d17] transition-colors duration-200 hover:bg-[#b3261e]/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#b3261e]"
              >
                Confirm remove
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="cursor-pointer rounded-[6px] border border-ink/15 px-[10px] py-[6px] text-[12px] text-muted transition-colors duration-200 hover:bg-ink/[0.05]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="cursor-pointer rounded-[6px] border border-ink/15 px-[10px] py-[6px] text-[12px] text-muted transition-colors duration-200 hover:border-[#b3261e]/40 hover:text-[#8a1d17] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {confirming && (
        <div className="border-t border-[#b3261e]/20 bg-[#b3261e]/[0.04] px-[16px] py-[10px] text-[12px] leading-[1.5] text-[#8a1d17]">
          Remove <strong>{title}</strong>? It comes off the live site when you publish.
        </div>
      )}

      {/* Expanded fields */}
      {expanded && (
        <div className="flex flex-col gap-[16px] border-t border-ink/10 px-[16px] py-[16px]">
          {/* Purchase type selector */}
          <div className="flex flex-col gap-[6px]">
            <span className="text-[13px] font-medium text-ink">How is this sold?</span>
            <div className="flex gap-[8px]">
              <button
                type="button"
                onClick={() => onChange([...path, "purchaseType"], "stripe")}
                className={`flex-1 cursor-pointer rounded-[8px] border px-[14px] py-[10px] text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold ${
                  !isExternal
                    ? "border-gold bg-gold/[0.08]"
                    : "border-ink/15 bg-paper hover:border-ink/25"
                }`}
              >
                <span className="block text-[13px] font-medium text-ink">Sell on this site</span>
                <span className="block text-[11px] text-muted">Stripe checkout</span>
              </button>
              <button
                type="button"
                onClick={() => onChange([...path, "purchaseType"], "external")}
                className={`flex-1 cursor-pointer rounded-[8px] border px-[14px] py-[10px] text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold ${
                  isExternal
                    ? "border-gold bg-gold/[0.08]"
                    : "border-ink/15 bg-paper hover:border-ink/25"
                }`}
              >
                <span className="block text-[13px] font-medium text-ink">Link to another store</span>
                <span className="block text-[11px] text-muted">Amazon, Gumroad, etc.</span>
              </button>
            </div>
          </div>

          {/* All product fields via the generic editor */}
          <FieldEditor
            value={product}
            path={path}
            onChange={onChange}
            assets={assets}
            flat
            depth={1}
            hideKeys={isExternal ? ["priceCents", "maxQty", "digitalFileUrl"] : ["externalUrl", "externalCtaLabel"]}
          />
        </div>
      )}
    </div>
  );
}

export default function ProductsPanel({
  products,
  path,
  onChange,
  assets,
}: {
  products: ProductContent[];
  path: Path;
  onChange: (path: Path, value: unknown) => void;
  assets: Assets;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  const addProduct = () => {
    const next = [
      ...products,
      { ...PRODUCT_TEMPLATE, featured: products.length === 0 },
    ];
    onChange(path, next);
    // Scroll to the new card after render
    setTimeout(() => {
      const cards = listRef.current?.querySelectorAll("[data-product-card]");
      cards?.[cards.length - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const removeProduct = (index: number) => {
    onChange(path, products.filter((_, j) => j !== index));
  };

  return (
    <div className="flex flex-col gap-[14px]" ref={listRef}>
      {products.map((p, i) => (
        <div key={i} data-product-card>
          <ProductCard
            product={p}
            index={i}
            path={[...path, i]}
            onChange={onChange}
            onRemove={removeProduct}
            assets={assets}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addProduct}
        className="cursor-pointer self-start rounded-full border border-gold/40 px-[18px] py-[10px] font-display text-[13px] text-gold transition-colors duration-200 hover:bg-gold/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        + Add a product
      </button>
    </div>
  );
}
