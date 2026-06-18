"use client";

import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useRef } from "react";

export type Tile = { src: string; href: string; alt: string };

const SPEED = 55; // pixels per second — gentle, constant drift

function TileLink({
  tile,
  eager,
  decorative,
}: {
  tile: Tile;
  eager: boolean;
  decorative?: boolean;
}) {
  return (
    <a
      href={tile.href}
      target="_blank"
      rel="noopener"
      aria-hidden={decorative}
      tabIndex={decorative ? -1 : 0}
      className="relative block aspect-square w-[clamp(120px,15vw,176px)] shrink-0 cursor-pointer overflow-hidden bg-panel mr-[3px] transition-shadow duration-300 ease-out hover:shadow-[0_14px_28px_-16px_rgba(26,23,20,0.42)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tile.src}
        alt={decorative ? "" : tile.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </a>
  );
}

export default function ArtMarquee({ tiles }: { tiles: Tile[] }) {
  const x = useMotionValue(0);
  const setRef = useRef<HTMLDivElement>(null);

  // Constant drift — intentionally runs regardless of the OS reduced-motion
  // setting, since this marquee is the section's defining motion.
  useAnimationFrame((_, delta) => {
    const setWidth = setRef.current?.offsetWidth ?? 0;
    if (!setWidth) return;
    let next = x.get() - (SPEED * delta) / 1000;
    // wrap seamlessly once a full set has scrolled past
    if (next <= -setWidth) next += setWidth;
    x.set(next);
  });

  return (
    <div className="relative w-full overflow-hidden">
      <motion.div className="flex w-max" style={{ x }}>
        {/* primary set (measured) */}
        <div ref={setRef} className="flex shrink-0">
          {tiles.map((tile, i) => (
            <TileLink key={tile.src} tile={tile} eager={i < 8} />
          ))}
        </div>
        {/* duplicate set for the seamless loop */}
        <div className="flex shrink-0" aria-hidden>
          {tiles.map((tile, i) => (
            <TileLink
              key={`dup-${tile.src}`}
              tile={tile}
              eager={false}
              decorative
            />
          ))}
        </div>
      </motion.div>

      {/* soft edge fades so tiles drift in/out of the paper background */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[clamp(24px,6vw,96px)] bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[clamp(24px,6vw,96px)] bg-gradient-to-l from-paper to-transparent" />
    </div>
  );
}
