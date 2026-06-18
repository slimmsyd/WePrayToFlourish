const TILES = ["art 01", "art 02", "art 03", "art 04", "art 05", "art 06", "art 07"];

const stripe =
  "repeating-linear-gradient(45deg,#ece5d6,#ece5d6 9px,#e3dccb 9px,#e3dccb 18px)";

export default function ArtCarousel() {
  return (
    <section id="art" className="bg-paper pt-[clamp(54px,8vh,92px)] pb-[clamp(40px,6vh,72px)]">
      <div>
        <div className="mx-[clamp(24px,6vw,96px)] mb-[26px] flex flex-wrap items-baseline justify-between gap-[14px]">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-[10px] font-display text-[13px] font-semibold uppercase tracking-[0.3em] text-ink transition-colors hover:text-gold"
          >
            Instagram <span className="font-normal">&#8599;</span>
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener"
            className="border-b border-ink/25 pb-[3px] text-[13px] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-ink"
          >
            Follow the art &rarr;
          </a>
        </div>

        <div className="flex snap-x snap-mandatory gap-[14px] overflow-x-auto px-[clamp(24px,6vw,96px)] pt-1 pb-4">
          {TILES.map((label) => (
            <a
              key={label}
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener"
              className="group relative block aspect-square w-[clamp(220px,26vw,300px)] shrink-0 snap-start overflow-hidden rounded-[2px] transition-transform duration-300 ease-out hover:-translate-y-[3px] hover:shadow-[0_16px_32px_-16px_rgba(26,23,20,0.42)]"
              style={{ background: stripe }}
            >
              <span className="absolute bottom-[10px] left-[11px] font-mono text-[10px] uppercase tracking-[0.12em] text-[#9b9384]">
                {label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
