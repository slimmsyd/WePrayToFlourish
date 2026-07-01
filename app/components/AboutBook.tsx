import { getSiteContent } from "@/lib/content";
import type { ProductContent } from "@/lib/content";
import AddToCartButton from "./AddToCartButton";
import BookHoverMedia from "./BookHoverMedia";

function ProductSection({
  product,
  sectionId,
  eyebrow,
  headline,
  metaLine,
  ctaLabel,
  imageFirst,
  showDivider,
}: {
  product: ProductContent;
  sectionId: string;
  eyebrow: string;
  headline: string;
  metaLine: string;
  ctaLabel: string;
  imageFirst: boolean;
  showDivider: boolean;
}) {
  const media = (
    <div className="flex justify-center md:justify-start">
      <BookHoverMedia
        coverImage={product.coverImage}
        coverAlt={product.coverAlt}
        hoverVideo={product.hoverVideo}
      />
    </div>
  );

  const copy = (
    <div className="flex max-w-[400px] flex-col items-start">
      <div className="flex items-center gap-[10px]">
        <span className="font-display text-[12px] font-medium text-muted">
          {eyebrow}
        </span>
        <span className="inline-flex items-center bg-ink px-[8px] py-[5px] font-display text-[12px] font-medium leading-none text-paper">
          {product.tagline}
        </span>
      </div>

      <h2 className="mt-[14px] m-0 font-display text-[15px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink">
        {headline}
      </h2>

      <span className="mt-[7px] text-[11px] text-ink/40">{metaLine}</span>

      <div className="mt-[18px] h-px w-full bg-ink/20" />

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

      <AddToCartButton productId={product.id} label={ctaLabel} />

      <div className="mt-[22px] flex flex-wrap gap-x-[16px] gap-y-[6px] text-[11px] text-ink/40">
        {product.tags.map((tag) => (
          <span key={tag} className="transition-colors hover:text-ink">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <section
      id={sectionId}
      className={`bg-panel px-[clamp(24px,6vw,120px)] py-[clamp(80px,14vh,160px)] ${
        showDivider ? "border-t border-ink/10" : ""
      }`}
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-x-[25px] gap-y-[28px] md:grid-cols-[1.3fr_1fr]">
        {imageFirst ? (
          <>
            {media}
            {copy}
          </>
        ) : (
          <>
            <div className="md:order-2">{media}</div>
            <div className="md:order-1">{copy}</div>
          </>
        )}
      </div>
    </section>
  );
}

export default async function AboutBook() {
  const site = await getSiteContent();
  if (site.products.length === 0) return null;

  const { eyebrow, headline, metaLine, ctaLabel } = site.copy.aboutBook;

  return (
    <>
      {site.products.map((product, i) => (
        <ProductSection
          key={product.id}
          product={product}
          sectionId={i === 0 ? "book" : `book-${product.id}`}
          eyebrow={eyebrow}
          headline={i === 0 ? headline : product.title}
          metaLine={
            i === 0
              ? metaLine
              : `${product.format} · by ${product.author} · $${(product.priceCents / 100).toFixed(2)}`
          }
          ctaLabel={ctaLabel}
          imageFirst={i % 2 === 0}
          showDivider={i > 0}
        />
      ))}
    </>
  );
}