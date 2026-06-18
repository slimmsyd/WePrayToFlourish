export default function AboutBook() {
  return (
    <section id="book" className="bg-panel px-[clamp(24px,6vw,96px)] py-[clamp(80px,12vh,150px)]">
      <div className="mx-auto grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-[clamp(40px,6vw,96px)]">
        <div className="flex justify-center">
          <div
            className="relative aspect-[1/1.18] w-full max-w-[420px] overflow-hidden rounded-[4px] shadow-[0_30px_70px_-30px_rgba(26,23,20,0.45),0_4px_14px_-6px_rgba(26,23,20,0.3)]"
            style={{
              backgroundImage: "url('/cover.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        <div className="flex max-w-[520px] flex-col items-start gap-6">
          <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">
            The book
          </span>
          <h2 className="m-0 font-display text-[clamp(30px,3.6vw,48px)] font-normal leading-[1.06] tracking-[-0.02em] text-ink">
            Fifty-two laws.
            <br />
            One year of becoming.
          </h2>
          <p className="m-0 text-[clamp(16px,1.4vw,18px)] font-light leading-[1.7] text-ink-soft">
            52 Laws of You is a year-long practice in self-mastery. Each week offers
            a single law to read, sit with, and live. Small enough to begin today,
            deep enough to return to for a lifetime.
          </p>
          <p className="m-0 text-[clamp(16px,1.4vw,18px)] font-light leading-[1.7] text-ink-soft">
            Drawn from faith, observation, and the wisdom of community, it asks one
            question on every page: who are you becoming when no one is watching?
          </p>
          <div className="mt-1 flex items-center gap-[18px] font-display text-[14px] uppercase tracking-[0.22em] text-ink">
            <span>Observe</span>
            <span className="text-[#c9b59a]">&middot;</span>
            <span>Restrain</span>
            <span className="text-[#c9b59a]">&middot;</span>
            <span>Flourish</span>
          </div>
          <a
            href="#chapter"
            className="mt-[10px] border-b-[1.5px] border-gold pb-[3px] text-[15px] font-semibold text-ink transition-colors hover:text-gold"
          >
            Start with the first law &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
