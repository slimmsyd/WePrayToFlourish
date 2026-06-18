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
    <section
      id="author"
      className="bg-paper px-[clamp(24px,6vw,120px)] py-[clamp(110px,20vh,240px)]"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-x-[25px] gap-y-[28px] md:grid-cols-[1.2fr_1fr]">
        <div className="flex justify-center md:justify-start">
          <div
            className="aspect-[4/5] w-full overflow-hidden rounded-[4px] bg-panel shadow-[0_40px_90px_-40px_rgba(26,23,20,0.42)] grayscale"
            role="img"
            aria-label="Portrait of Yaddin"
            style={{
              backgroundImage: "url('/AuthorPicture.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        <div className="flex max-w-[420px] flex-col items-start">
          {/* Label + tag */}
          <div className="flex items-center gap-[10px]">
            <span className="font-display text-[12px] font-medium text-muted">
              The author
            </span>
            <span className="inline-flex items-center bg-ink px-[8px] py-[5px] font-display text-[12px] font-medium leading-none text-paper">
              Yaddin
            </span>
          </div>

          {/* Title */}
          <h2 className="mt-[14px] m-0 font-display text-[15px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink">
            Faith, philosophy, and the work of becoming.
          </h2>

          {/* Meta sub-line */}
          <span className="mt-[7px] text-[11px] text-ink/40">
            Writer &middot; Speak less, notice more
          </span>

          {/* Hairline rule */}
          <div className="mt-[18px] h-px w-full bg-ink/20" />

          {/* Body */}
          <div className="mt-[18px] flex flex-col gap-[14px]">
            <p className="m-0 text-[13px] font-light leading-[1.9] text-ink-soft">
              Yaddin writes at the intersection of faith, philosophy, and the everyday
              discipline of becoming a better person.
            </p>
            <p className="m-0 text-[13px] font-light leading-[1.9] text-ink-soft">
              His work invites readers to speak less, notice more, and build lives and
              communities that truly flourish.
            </p>
          </div>

          {/* Filled pill button */}
          <a
            href="#chapter"
            className="mt-[26px] inline-flex items-center justify-center rounded-full bg-[#6a6056] px-[40px] py-[13px] text-[13px] font-medium tracking-[0.04em] text-paper transition-colors hover:bg-ink-soft"
          >
            Get the first chapter free
          </a>

          {/* Listen — meta row of song chips */}
          <div className="mt-[24px] flex w-full flex-col gap-[10px]">
            <span className="text-[11px] uppercase tracking-[0.2em] text-ink/40">
              Listen
            </span>
            <div className="flex snap-x snap-mandatory gap-[8px] overflow-x-auto pb-2">
              {SONGS.map((song) => (
                <a
                  key={song}
                  href="#"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex shrink-0 snap-start items-center gap-[6px] whitespace-nowrap rounded-full border border-ink/20 px-[13px] py-[7px] font-display text-[12px] tracking-[0.01em] text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <span className="text-gold">&#9834;</span>
                  {song}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
