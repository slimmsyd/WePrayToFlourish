"use client";

import type { EditorSection } from "./editor-schema";

export default function SectionSidebar({
  sections,
  activeId,
  dirtyIds,
  onSelect,
}: {
  sections: EditorSection[];
  activeId: string;
  dirtyIds: Set<string>;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Site sections" className="flex flex-col">
      {/* Desktop vertical list */}
      <ul className="hidden m-0 list-none flex-col gap-[2px] p-[12px] lg:flex">
        {sections.map((s) => {
          const active = s.id === activeId;
          const dirty = dirtyIds.has(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                className={`flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-[12px] py-[10px] text-left font-display text-[13px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold ${
                  active
                    ? "bg-dark text-paper"
                    : "text-ink-soft hover:bg-ink/[0.06] hover:text-ink"
                }`}
              >
                <span className={active ? "text-gold-light" : "text-muted"}>{s.icon}</span>
                <span className="flex-1 truncate">{s.title}</span>
                {dirty && (
                  <span
                    className={`h-[6px] w-[6px] shrink-0 rounded-full ${
                      active ? "bg-gold-light" : "bg-gold"
                    }`}
                    aria-label="Unsaved changes"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Mobile horizontal chips */}
      <div className="flex gap-[8px] overflow-x-auto p-[12px] lg:hidden">
        {sections.map((s) => {
          const active = s.id === activeId;
          const dirty = dirtyIds.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={`flex shrink-0 cursor-pointer items-center gap-[6px] rounded-full px-[14px] py-[8px] font-display text-[12px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                active
                  ? "bg-dark text-paper"
                  : "border border-ink/15 bg-paper text-ink-soft hover:border-gold/40"
              }`}
            >
              {s.title}
              {dirty && (
                <span className="h-[5px] w-[5px] rounded-full bg-gold" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
