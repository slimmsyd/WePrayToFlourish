"use client";

import type { SiteContent } from "@/lib/content";
import { getAt, type EditorSection, type Path } from "./editor-schema";
import { FieldEditor, type Assets } from "./FieldEditor";

export default function SectionPanel({
  section,
  draft,
  onChange,
  assets,
  siteUrl,
}: {
  section: EditorSection;
  draft: SiteContent;
  onChange: (path: Path, value: unknown) => void;
  assets: Assets;
  siteUrl: string;
}) {
  const viewUrl = `${siteUrl.replace(/\/$/, "")}${section.previewUrl}`;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-[clamp(16px,3vw,24px)]">
      <header className="mb-[20px] flex flex-col gap-[8px] border-b border-ink/10 pb-[16px]">
        <h2 className="m-0 font-display text-[22px] font-normal leading-[1.1] tracking-[-0.02em] text-ink">
          {section.title}
        </h2>
        <p className="m-0 text-[14px] leading-[1.5] text-ink-soft">{section.description}</p>
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit cursor-pointer items-center gap-[4px] font-display text-[13px] text-gold transition-colors duration-200 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          View on site
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </header>

      {section.id === "products" && (
        <div className="mb-[16px] rounded-[8px] border border-gold/25 bg-gold/[0.06] px-[14px] py-[12px] text-[13px] leading-[1.55] text-ink-soft">
          <strong className="font-medium text-ink">Adding another book?</strong> Use{" "}
          <span className="font-medium text-ink">+ Add another book</span> below, give it a
          unique ID (e.g. <code className="text-[12px]">second-book</code>), and mark only one
          product as featured. Shipping settings are under{" "}
          <span className="font-medium text-ink">Pricing &amp; shipping</span>.
        </div>
      )}

      <div className="flex flex-col gap-[20px]">
        {section.paths.map((p) => {
          const value = getAt(draft, p);
          if (value === undefined) return null;
          return (
            <FieldEditor
              key={p.join(".")}
              value={value}
              path={p}
              onChange={onChange}
              assets={assets}
              flat
            />
          );
        })}
      </div>
    </div>
  );
}
