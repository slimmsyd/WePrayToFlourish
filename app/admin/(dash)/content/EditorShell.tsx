"use client";

import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { saveContentAction, type SaveState } from "../../actions";
import type { SiteContent } from "@/lib/content";
import type { Assets } from "./FieldEditor";
import {
  getAllSections,
  isSectionDirty,
  type Path,
} from "./editor-schema";
import SectionSidebar from "./SectionSidebar";
import SectionPanel from "./SectionPanel";
import PreviewPane from "./PreviewPane";

const initialState: SaveState = {};

/** Immutable deep-set: returns a clone of `obj` with `path` set to `value`. */
function setAt(obj: unknown, path: Path, value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const copy = [...obj];
    copy[head as number] = setAt(copy[head as number], rest, value);
    return copy;
  }
  const copy = { ...(obj as Record<string, unknown>) };
  copy[head as string] = setAt(copy[head as string], rest, value);
  return copy;
}

export default function EditorShell({
  initial,
  assets,
  siteUrl,
}: {
  initial: SiteContent;
  assets: Assets;
  siteUrl: string;
}) {
  const [baseline, setBaseline] = useState<SiteContent>(() => structuredClone(initial));
  const [draft, setDraft] = useState<SiteContent>(() => structuredClone(initial));
  const [activeSectionId, setActiveSectionId] = useState("sections");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);

  const handleSave = useCallback(async (prev: SaveState, formData: FormData) => {
    const result = await saveContentAction(prev, formData);
    if (result.ok) {
      try {
        const parsed = JSON.parse(
          String(formData.get("draft") ?? ""),
        ) as SiteContent;
        setBaseline(parsed);
        setPreviewKey((k) => k + 1);
      } catch {
        /* ignore parse errors */
      }
    }
    return result;
  }, []);

  const [state, action, pending] = useActionState(handleSave, initialState);

  const sections = useMemo(() => getAllSections(draft), [draft]);

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId) ?? sections[0],
    [sections, activeSectionId],
  );

  const dirtySections = useMemo(() => {
    const set = new Set<string>();
    for (const s of sections) {
      if (isSectionDirty(s, draft, baseline)) set.add(s.id);
    }
    return set;
  }, [draft, sections, baseline]);

  const isDirty = dirtySections.size > 0;

  const onChange = useCallback((path: Path, value: unknown) => {
    setDraft((d) => {
      let next = setAt(d, path, value) as SiteContent;
      if (
        path.length === 3 &&
        path[0] === "products" &&
        path[2] === "featured" &&
        value === true
      ) {
        const idx = path[1] as number;
        next = {
          ...next,
          products: next.products.map((p, i) => ({
            ...p,
            featured: i === idx,
          })),
        };
      }
      return next;
    });
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return (
    <form action={action} className="flex min-h-[calc(100vh-180px)] flex-col">
      <input type="hidden" name="draft" value={JSON.stringify(draft)} />

      <div className="flex flex-1 flex-col gap-0 lg:flex-row lg:gap-0 lg:overflow-hidden lg:rounded-[12px] lg:border lg:border-ink/10">
        {/* Sidebar */}
        <aside className="shrink-0 border-b border-ink/10 bg-panel/40 lg:w-[240px] lg:border-b-0 lg:border-r">
          <SectionSidebar
            sections={sections}
            activeId={activeSection?.id ?? "sections"}
            dirtyIds={dirtySections}
            onSelect={setActiveSectionId}
          />
        </aside>

        {/* Editor panel */}
        <div className="flex min-w-0 flex-1 flex-col lg:max-w-[520px] lg:border-r lg:border-ink/10">
          {activeSection && (
            <SectionPanel
              section={activeSection}
              draft={draft}
              onChange={onChange}
              assets={assets}
              siteUrl={siteUrl}
            />
          )}
        </div>

        {/* Preview — desktop side panel */}
        <div
          className={`hidden min-w-0 flex-1 flex-col bg-panel/20 lg:flex ${
            previewOpen ? "" : "lg:hidden"
          }`}
        >
          {activeSection && (
            <PreviewPane
              siteUrl={siteUrl}
              previewUrl={activeSection.previewUrl}
              refreshKey={previewKey}
            />
          )}
        </div>
      </div>

      {/* Mobile preview toggle + drawer */}
      <div className="mt-[16px] lg:hidden">
        <button
          type="button"
          onClick={() => setPreviewOpen((o) => !o)}
          className="cursor-pointer rounded-full border border-ink/20 bg-panel px-[18px] py-[10px] font-display text-[13px] text-ink transition-colors duration-200 hover:bg-ink/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {previewOpen ? "Hide preview" : "Show preview"}
        </button>
        {previewOpen && activeSection && (
          <div className="mt-[12px] overflow-hidden rounded-[12px] border border-ink/10">
            <PreviewPane
              siteUrl={siteUrl}
              previewUrl={activeSection.previewUrl}
              refreshKey={previewKey}
              compact
            />
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-30 mt-[20px] flex flex-wrap items-center gap-[12px] border-t border-ink/10 bg-paper/95 py-[14px] backdrop-blur">
        <button
          type="submit"
          disabled={pending || !isDirty}
          className="cursor-pointer rounded-full border-none bg-dark px-[26px] py-[13px] font-display text-[15px] font-medium tracking-[0.02em] text-paper transition-colors duration-200 hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Publishing…" : "Publish changes"}
        </button>
        {isDirty && !pending && (
          <span className="text-[14px] text-ink-soft">Unsaved changes</span>
        )}
        {state.ok && !isDirty && (
          <span className="text-[14px] font-medium text-[#2f6b3a]">
            Saved &amp; published
          </span>
        )}
        {state.error && (
          <span className="text-[14px] text-[#8a1d17]">{state.error}</span>
        )}
      </div>
    </form>
  );
}
