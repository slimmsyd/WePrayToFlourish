import { getSiteContent } from "@/lib/content";

export default async function Community() {
  const { eyebrow, headline, body, photos } = (await getSiteContent()).copy.community;
  return (
    <section id="community" className="bg-panel px-[clamp(24px,6vw,96px)] py-[clamp(80px,12vh,150px)]">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-[clamp(36px,5vh,56px)]">
        <div className="flex max-w-[640px] flex-col items-start gap-[18px]">
          <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">
            {eyebrow}
          </span>
          <h2 className="m-0 font-display text-[clamp(30px,3.6vw,48px)] font-normal leading-[1.06] tracking-[-0.02em] text-ink">
            {headline}
          </h2>
          <p className="m-0 text-[clamp(16px,1.4vw,18px)] font-light leading-[1.7] text-ink-soft">
            {body}
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[clamp(16px,2.4vw,28px)]">
          {photos.map((photo) => (
            <figure key={photo.caption} className="m-0 flex flex-col gap-3">
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[3px] bg-paper text-[12px] uppercase tracking-[0.2em] text-muted">
                Drop a photo
              </div>
              <figcaption className="text-[14px] font-light tracking-[0.02em] text-ink-soft">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
