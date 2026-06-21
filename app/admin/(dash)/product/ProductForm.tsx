"use client";

import { useActionState } from "react";
import { saveProductAction, type SaveState } from "../../actions";
import type { ProductContent } from "@/lib/content";

const initialState: SaveState = {};

const inputClass =
  "w-full rounded-[8px] border border-[rgba(26,23,20,0.22)] bg-paper px-[14px] py-[11px] font-body text-[15px] text-ink outline-none transition-colors focus:border-gold";
const labelClass =
  "flex flex-col gap-[6px] text-[12px] font-medium uppercase tracking-[0.08em] text-muted";
const sectionClass =
  "flex flex-col gap-[18px] rounded-[10px] bg-panel p-[clamp(20px,3vw,28px)]";
const sectionTitle = "font-display text-[13px] uppercase tracking-[0.16em] text-ink";

export default function ProductForm({
  initial,
  assets,
}: {
  initial: ProductContent;
  assets: { images: string[]; videos: string[] };
}) {
  const [state, action, pending] = useActionState(saveProductAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-[20px]">
      {/* Identity */}
      <fieldset className={sectionClass}>
        <legend className={sectionTitle}>Identity</legend>
        <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
          <label className={labelClass}>
            Title
            <input name="title" defaultValue={initial.title} required className={inputClass} />
          </label>
          <label className={labelClass}>
            Author
            <input name="author" defaultValue={initial.author} required className={inputClass} />
          </label>
          <label className={labelClass}>
            Format
            <input name="format" defaultValue={initial.format} className={inputClass} />
          </label>
          <label className={labelClass}>
            Tagline (pill)
            <input name="tagline" defaultValue={initial.tagline} className={inputClass} />
          </label>
        </div>
      </fieldset>

      {/* Pricing */}
      <fieldset className={sectionClass}>
        <legend className={sectionTitle}>Pricing &amp; shipping</legend>
        <div className="grid grid-cols-2 gap-[16px] sm:grid-cols-3">
          <label className={labelClass}>
            Price (USD)
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={(initial.priceCents / 100).toFixed(2)}
              required
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Shipping (USD)
            <input
              name="shipFlat"
              type="number"
              step="0.01"
              min="0"
              defaultValue={(initial.shipFlatCents / 100).toFixed(2)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Free ship over (USD)
            <input
              name="freeShipThreshold"
              type="number"
              step="0.01"
              min="0"
              defaultValue={(initial.freeShipThresholdCents / 100).toFixed(2)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Tax rate (%)
            <input
              name="taxRatePct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={(initial.taxRate * 100).toString()}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Currency
            <input name="currency" defaultValue={initial.currency} className={inputClass} />
          </label>
          <label className={labelClass}>
            Max qty / order
            <input
              name="maxQty"
              type="number"
              step="1"
              min="1"
              defaultValue={initial.maxQty.toString()}
              className={inputClass}
            />
          </label>
        </div>
      </fieldset>

      {/* Media */}
      <fieldset className={sectionClass}>
        <legend className={sectionTitle}>Media</legend>
        <datalist id="public-images">
          {assets.images.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        <datalist id="public-videos">
          {assets.videos.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
          <label className={labelClass}>
            Cover image (path or URL)
            <input
              name="coverImage"
              defaultValue={initial.coverImage}
              list="public-images"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Cover alt text
            <input name="coverAlt" defaultValue={initial.coverAlt} className={inputClass} />
          </label>
          <label className={labelClass}>
            Hover video (path or URL, optional)
            <input
              name="hoverVideo"
              defaultValue={initial.hoverVideo}
              list="public-videos"
              className={inputClass}
            />
          </label>
        </div>
      </fieldset>

      {/* Copy */}
      <fieldset className={sectionClass}>
        <legend className={sectionTitle}>Description</legend>
        <label className={labelClass}>
          Short description (hero)
          <textarea
            name="shortDescription"
            defaultValue={initial.shortDescription}
            rows={2}
            className={`${inputClass} resize-y`}
          />
        </label>
        <label className={labelClass}>
          Long description (one paragraph per blank line)
          <textarea
            name="longDescription"
            defaultValue={initial.longDescription.join("\n\n")}
            rows={6}
            className={`${inputClass} resize-y`}
          />
        </label>
        <label className={labelClass}>
          Tags (comma separated)
          <input name="tags" defaultValue={initial.tags.join(", ")} className={inputClass} />
        </label>
      </fieldset>

      {/* Save bar */}
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
