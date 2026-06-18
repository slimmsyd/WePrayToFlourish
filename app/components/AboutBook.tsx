import AddToCartButton from "./AddToCartButton";
import BookHoverMedia from "./BookHoverMedia";

export default function AboutBook() {
  return (
    <section
      id="book"
      className="bg-panel px-[clamp(24px,6vw,120px)] py-[clamp(110px,20vh,240px)]"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-x-[25px] gap-y-[28px] md:grid-cols-[1.3fr_1fr]">
        <div className="flex justify-center md:justify-start">
          <BookHoverMedia />
        </div>

        <div className="flex max-w-[400px] flex-col items-start">
          {/* Label + tag */}
          <div className="flex items-center gap-[10px]">
            <span className="font-display text-[12px] font-medium text-muted">
              The book
            </span>
            <span className="inline-flex items-center bg-ink px-[8px] py-[5px] font-display text-[12px] font-medium leading-none text-paper">
              52 Laws of You
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
            <p className="m-0 text-[13px] font-light leading-[1.9] text-ink-soft">
              52 Laws of You is a year-long practice in self-mastery. Each week offers
              a single law to read, sit with, and live. Small enough to begin today,
              deep enough to return to for a lifetime.
            </p>
            <p className="m-0 text-[13px] font-light leading-[1.9] text-ink-soft">
              Drawn from faith, observation, and the wisdom of community, it asks one
              question on every page: who are you becoming when no one is watching?
            </p>
          </div>

          {/* Filled pill button — adds the book to the cart */}
          <AddToCartButton />

          {/* Meta tags */}
          <div className="mt-[22px] flex flex-wrap gap-x-[16px] gap-y-[6px] text-[11px] text-ink/40">
            <span className="transition-colors hover:text-ink">#observe</span>
            <span className="transition-colors hover:text-ink">#restrain</span>
            <span className="transition-colors hover:text-ink">#flourish</span>
          </div>
        </div>
      </div>
    </section>
  );
}
