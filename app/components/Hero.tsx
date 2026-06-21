"use client";

import { Fragment, useEffect, useState } from "react";
import { useSiteContent } from "@/lib/site-content";

function overlayGradient(ov: number) {
  return `linear-gradient(180deg, rgba(10,9,16,${(ov * 0.72).toFixed(3)}) 0%, rgba(10,9,16,${(ov * 0.12).toFixed(3)}) 36%, rgba(10,9,16,${(ov * 0.28).toFixed(3)}) 60%, rgba(10,9,16,${Math.min(ov + 0.28, 0.96).toFixed(3)}) 100%)`;
}

export default function Hero() {
  const site = useSiteContent();
  const { headline, slides: SLIDES, primaryCta, secondaryCta, overlay, intervalMs } =
    site.copy.hero;
  const byline = `A new book by ${site.product.author}`;
  const sub = site.product.shortDescription;
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setSlide((s) => (s + 1) % SLIDES.length),
      intervalMs
    );
    return () => clearInterval(timer);
  }, [SLIDES.length, intervalMs]);

  const goTo = (i: number) => setSlide(i);

  return (
    <header
      id="top"
      className="relative flex h-[calc(100vh-76px)] min-h-[600px] w-full overflow-hidden bg-dark"
    >
      {SLIDES.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[1600ms] ease-in-out"
          style={{
            opacity: slide === i ? 1 : 0,
            zIndex: slide === i ? 2 : 1,
            pointerEvents: slide === i ? "auto" : "none",
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{ background: overlayGradient(overlay) }}
      />

      <div className="relative z-[6] mx-auto flex w-full max-w-[1442px] flex-col items-start gap-[22px] self-end px-[clamp(24px,6vw,96px)] pb-[clamp(56px,9vh,104px)]">
        <span className="font-display text-[13px] uppercase tracking-[0.32em] text-gold-light">
          {byline}
        </span>
        <h1 className="m-0 font-display text-[clamp(46px,8.4vw,116px)] font-normal leading-[0.94] tracking-[-0.025em] text-balance text-paper">
          {headline.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </h1>
        <p className="m-0 max-w-[48ch] text-[clamp(16px,1.5vw,20px)] font-light leading-[1.6] text-paper/[0.86]">
          {sub}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <a
            href={primaryCta.href}
            className="rounded-full bg-paper px-7 py-[15px] text-[15px] font-semibold tracking-[0.02em] text-ink transition-colors hover:bg-white"
          >
            {primaryCta.label}
          </a>
          <a
            href={secondaryCta.href}
            className="border-b border-paper/50 pb-[3px] text-[15px] tracking-[0.04em] text-paper transition-colors hover:border-white"
          >
            {secondaryCta.label}
          </a>
        </div>
      </div>

      <div className="absolute bottom-[clamp(20px,3vh,34px)] right-[clamp(24px,6vw,96px)] z-[6] flex gap-[10px]">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show slide ${i + 1}`}
            className="h-[9px] w-[9px] cursor-pointer rounded-full border-none p-0 transition-colors"
            style={{
              background: slide === i ? "#F6F2EA" : "rgba(246,242,234,0.45)",
            }}
          />
        ))}
      </div>
    </header>
  );
}
