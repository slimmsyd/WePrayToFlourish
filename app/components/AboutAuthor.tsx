const SONGS = [
  "Flourish",
  "Speak Less",
  "Patience",
  "Moonlight",
  "Becoming",
  "Stillness",
  "Community",
];

export default function AboutAuthor() {
  return (
    <section id="author" className="bg-paper px-[clamp(24px,6vw,96px)] py-[clamp(80px,12vh,150px)]">
      <div className="mx-auto grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-[clamp(40px,6vw,96px)]">
        <div className="order-2 flex max-w-[520px] flex-col items-start gap-6">
          <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">
            The author
          </span>
          <h2 className="m-0 font-display text-[clamp(34px,4.4vw,60px)] font-normal leading-none tracking-[-0.02em] text-ink">
            Yaddin
          </h2>
          <p className="m-0 text-[clamp(16px,1.4vw,18px)] font-light leading-[1.7] text-ink-soft">
            Yaddin writes at the intersection of faith, philosophy, and the everyday
            discipline of becoming a better person.
          </p>
          <p className="m-0 text-[clamp(16px,1.4vw,18px)] font-light leading-[1.7] text-ink-soft">
            His work invites readers to speak less, notice more, and build lives and
            communities that truly flourish.
          </p>

          <div className="mt-[6px] flex w-full flex-col gap-[14px]">
            <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">
              Listen
            </span>
            <div className="flex snap-x snap-mandatory gap-[10px] overflow-x-auto pb-2">
              {SONGS.map((song) => (
                <a
                  key={song}
                  href="#"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full border border-ink/20 px-[17px] py-[9px] font-display text-[14px] tracking-[0.01em] text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <span className="text-gold">&#9834;</span>
                  {song}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="order-1 flex justify-center">
          <div className="flex aspect-[4/5] w-full max-w-[420px] items-center justify-center rounded-[4px] bg-panel text-[13px] uppercase tracking-[0.2em] text-muted shadow-[0_30px_70px_-34px_rgba(26,23,20,0.4)]">
            Drop author portrait
          </div>
        </div>
      </div>
    </section>
  );
}
