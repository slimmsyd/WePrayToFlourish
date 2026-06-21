import type { ProductContent } from "@/lib/content";
import AddToCartButton from "./AddToCartButton";
import BookHoverMedia from "./BookHoverMedia";

export default function AboutBook({ product }: { product: ProductContent }) {
  return (
    <section
      id="book"
      className="bg-panel px-[clamp(24px,6vw,120px)] py-[clamp(110px,20vh,240px)]"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-x-[25px] gap-y-[28px] md:grid-cols-[1.3fr_1fr]">
        <div className="flex justify-center md:justify-start">
          <BookHoverMedia
            coverImage={product.coverImage}
            coverAlt={product.coverAlt}
            hoverVideo={product.hoverVideo}
          />
        </div>

        <div className="flex max-w-[400px] flex-col items-start">
          {/* Label + tag */}
          <div className="flex items-center gap-[10px]">
            <span className="font-display text-[12px] font-medium text-muted">
              The book
            </span>
            <span className="inline-flex items-center bg-ink px-[8px] py-[5px] font-display text-[12px] font-medium leading-none text-paper">
              {product.tagline}
            </span>
          </div>

          {/* Title */}
          <h2 className="mt-[14px] m-0 font-display text-[15px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink">
            Fifty-two laws. One year of becoming.
          </h2>

          {/* Meta sub-line */}
          <span className="mt-[7px] text-[11px] text-ink/40">
            A weekly practice &middot; 52 chapters
          </span>

          {/* Hairline rule */}
          <div className="mt-[18px] h-px w-full bg-ink/20" />

          {/* Body */}
          <div className="mt-[18px] flex flex-col gap-[14px]">
            {product.longDescription.map((para, i) => (
              <p
                key={i}
                className="m-0 text-[13px] font-light leading-[1.9] text-ink-soft"
              >
                {para}
              </p>
            ))}
          </div>

          {/* Filled pill button — adds the book to the cart */}
          <AddToCartButton />

          {/* Meta tags */}
          <div className="mt-[22px] flex flex-wrap gap-x-[16px] gap-y-[6px] text-[11px] text-ink/40">
            {product.tags.map((tag) => (
              <span key={tag} className="transition-colors hover:text-ink">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
