"use client";

import { useActionState, useState } from "react";
import { saveContentAction, type SaveState } from "../../actions";
import type { SiteContent } from "@/lib/content";
import { FieldEditor, humanize, type Assets } from "./FieldEditor";

type Path = (string | number)[];

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

const initialState: SaveState = {};

/** Surface catalog + shipping before the rest of the site copy. */
const EDITOR_ORDER = [
  "commerce",
  "products",
  "sections",
  "brand",
  "nav",
  "footer",
  "social",
  "copy",
  "seo",
];

function sortedEntries(draft: SiteContent): [string, unknown][] {
  return Object.entries(draft as Record<string, unknown>).sort(([a], [b]) => {
    const ai = EDITOR_ORDER.indexOf(a);
    const bi = EDITOR_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

export default function ContentEditor({
  initial,
  assets,
}: {
  initial: SiteContent;
  assets: Assets;
}) {
  const [draft, setDraft] = useState<SiteContent>(() => structuredClone(initial));
  const [state, action, pending] = useActionState(saveContentAction, initialState);

  const onChange = (path: Path, value: unknown) => {
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
  };

  return (
    <form action={action} className="flex flex-col gap-[18px]">
      <input type="hidden" name="draft" value={JSON.stringify(draft)} />

      {sortedEntries(draft).map(([k, v]) => (
        <FieldEditor
          key={k}
          value={v}
          path={[k]}
          onChange={onChange}
          assets={assets}
          label={humanize(k)}
        />
      ))}

      <div className="sticky bottom-0 flex items-center gap-[16px] border-t border-ink/10 bg-paper/95 py-[16px] backdrop-blur">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-full border-none bg-dark px-[26px] py-[13px] font-display text-[15px] font-medium tracking-[0.02em] text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        {state.ok && (
          <span className="text-[14px] font-medium text-[#2f6b3a]">Saved &amp; published ✓</span>
        )}
        {state.error && <span className="text-[14px] text-[#8a1d17]">{state.error}</span>}
      </div>
    </form>
  );
}
