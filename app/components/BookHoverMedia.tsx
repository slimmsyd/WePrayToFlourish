"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Book showcase: shows the still cover (book.png) at rest, then plays the
 * preview video through ONCE and freezes on its final frame. It triggers the
 * first time the book scrolls into view (so mobile / no-hover users see it),
 * and also on hover or focus — whichever happens first. Plays only once.
 */
export default function BookHoverMedia({
  coverImage,
  coverAlt,
  hoverVideo,
}: {
  coverImage: string;
  coverAlt: string;
  hoverVideo: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  const start = () => {
    if (playedRef.current) return; // play only once
    playedRef.current = true;
    setRevealed(true);
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => {});
  };

  // Auto-trigger when the book enters the viewport (covers mobile / no hover).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full max-w-[440px]"
      onMouseEnter={start}
      onFocus={start}
      tabIndex={0}
      aria-label={coverAlt}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverImage}
        alt={coverAlt}
        className="h-auto w-full object-contain"
      />
      {hoverVideo && (
        <video
          ref={videoRef}
          src={hoverVideo}
          muted
          playsInline
          preload="auto"
          aria-hidden
          className={`pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ease-out ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
