export default function Quote() {
  return (
    <section className="flex justify-center bg-paper px-[clamp(24px,6vw,96px)] py-[clamp(96px,16vh,200px)]">
      <figure className="m-0 flex max-w-[1000px] flex-col items-center gap-10 text-center">
        <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">
          From the book
        </span>
        <blockquote className="m-0 font-display text-[clamp(28px,4.4vw,58px)] font-light leading-[1.18] tracking-[-0.015em] text-balance text-ink">
          Speak less, and you&rsquo;ll learn a lot about them,{" "}
          <span className="text-gold">while they&rsquo;ll know a little about you.</span>
        </blockquote>
        <figcaption className="text-[13px] uppercase tracking-[0.18em] text-ink-soft">
          Law 12 &middot; 52 Laws of You
        </figcaption>
      </figure>
    </section>
  );
}
