"use client";

import { useRef, useState } from "react";

/**
 * Book showcase: shows the still cover (book.png) at rest. The first time the
 * user hovers (or focuses) the section, the preview video crossfades in, plays
 * through once, and freezes on its final frame — staying that way afterward.
 */
export default function BookHoverMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealed, setRevealed] = useState(false);

  const start = () => {
    if (revealed) return; // play only once
    setRevealed(true);
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => {});
  };

  return (
    <div
      className="relative w-full max-w-[440px] cursor-pointer"
      onMouseEnter={start}
      onFocus={start}
      tabIndex={0}
      aria-label="52 Laws of You, hardcover edition. Hover to preview."
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/book.png"
        alt="52 Laws of You, hardcover edition"
        className="h-auto w-full object-contain"
      />
      <video
        ref={videoRef}
        src="/book-hover.mp4"
        muted
        playsInline
        preload="metadata"
        aria-hidden
        className={`pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ease-out ${
          revealed ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
