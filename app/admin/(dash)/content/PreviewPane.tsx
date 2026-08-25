"use client";

import { useState } from "react";

export default function PreviewPane({
  siteUrl,
  previewUrl,
  refreshKey,
  compact = false,
}: {
  siteUrl: string;
  previewUrl: string;
  refreshKey: number;
  compact?: boolean;
}) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const base = siteUrl.replace(/\/$/, "");
  const src = `${base}${previewUrl}`;

  return (
    <div className={`flex flex-col ${compact ? "h-[420px]" : "h-full min-h-[480px]"}`}>
      <div className="flex items-center justify-between gap-[8px] border-b border-ink/10 px-[14px] py-[10px]">
        <span className="font-display text-[12px] uppercase tracking-[0.12em] text-muted">
          Live preview
        </span>
        <div className="flex rounded-[6px] border border-ink/15 p-[2px]">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`cursor-pointer rounded-[4px] px-[10px] py-[4px] font-display text-[11px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold ${
              viewport === "desktop"
                ? "bg-dark text-paper"
                : "text-muted hover:text-ink"
            }`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`cursor-pointer rounded-[4px] px-[10px] py-[4px] font-display text-[11px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold ${
              viewport === "mobile"
                ? "bg-dark text-paper"
                : "text-muted hover:text-ink"
            }`}
          >
            Mobile
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-auto bg-[#e8e4dc] p-[16px]">
        <div
          className={`overflow-hidden rounded-[8px] border border-ink/15 bg-paper shadow-sm transition-[width] duration-300 motion-reduce:transition-none ${
            viewport === "mobile" ? "w-[375px]" : "w-full max-w-[640px]"
          }`}
          style={{ height: compact ? 340 : viewport === "mobile" ? 667 : 480 }}
        >
          <iframe
            key={`${refreshKey}-${previewUrl}-${viewport}`}
            src={src}
            title="Site preview"
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    </div>
  );
}
