"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  "/FlourishAssets/hero.jpg",
  "/FlourishAssets/Asset1.jpg",
  "/FlourishAssets/Asset2.jpg",
  "/FlourishAssets/Asset3.jpg",
  "/FlourishAssets/Asset4.jpg",
  "/FlourishAssets/Asset5.jpg",
  "/FlourishAssets/Asset6.jpg",
  "/FlourishAssets/Asset7.jpg",
  "/FlourishAssets/Asset8.jpg",
];
const HERO_OVERLAY = 0.55;

function overlayGradient(ov: number) {
  return `linear-gradient(180deg, rgba(10,9,16,${(ov * 0.72).toFixed(3)}) 0%, rgba(10,9,16,${(ov * 0.12).toFixed(3)}) 36%, rgba(10,9,16,${(ov * 0.28).toFixed(3)}) 60%, rgba(10,9,16,${Math.min(ov + 0.28, 0.96).toFixed(3)}) 100%)`;
}

export default function Hero() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setSlide((s) => (s + 1) % SLIDES.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

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
        style={{ background: overlayGradient(HERO_OVERLAY) }}
      />

      <div className="relative z-[6] mx-auto flex w-full max-w-[1442px] flex-col items-start gap-[22px] self-end px-[clamp(24px,6vw,96px)] pb-[clamp(56px,9vh,104px)]">
        <span className="font-display text-[13px] uppercase tracking-[0.32em] text-gold-light">
          A new book by Yaddin
        </span>
        <h1 className="m-0 font-display text-[clamp(46px,8.4vw,116px)] font-normal leading-[0.94] tracking-[-0.025em] text-balance text-paper">
          We&nbsp;Pray
          <br />
          To&nbsp;Flourish
        </h1>
        <p className="m-0 max-w-[48ch] text-[clamp(16px,1.5vw,20px)] font-light leading-[1.6] text-paper/[0.86]">
          52 Laws of You is the book Yaddin has ushered in: a weekly practice in
          becoming, for anyone learning to speak less, notice more, and flourish.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <a
            href="#chapter"
            className="rounded-full bg-paper px-7 py-[15px] text-[15px] font-semibold tracking-[0.02em] text-ink transition-colors hover:bg-white"
          >
            Get the first chapter free
          </a>
          <a
            href="#book"
            className="border-b border-paper/50 pb-[3px] text-[15px] tracking-[0.04em] text-paper transition-colors hover:border-white"
          >
            Read about the book
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
