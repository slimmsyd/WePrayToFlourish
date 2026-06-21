"use client";

import { Fragment, useId, useRef, useState } from "react";

export type Assets = { images: string[]; videos: string[] };

type Path = (string | number)[];

// Image-ish fields get a live preview + drag-and-drop upload; videos keep the
// path/picker only (encoding video as a data URL would be far too large).
const IMAGE_KEY = /image|cover|logo|photo|slide|icon|avatar|thumb|art|banner/i;
// "coverAlt"/"logoAlt"/"imageAlt" are alt TEXT, not image paths — keep them text.
const isImageKey = (k: string) => IMAGE_KEY.test(k) && !/alt/i.test(k);

/**
 * Read a dropped/selected image into a data URL. Raster images are downscaled
 * (max 1600px wide) and re-encoded so the stored string stays reasonable; SVGs
 * are kept as-is to preserve vector quality.
 */
function fileToDataUrl(file: File, maxW = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml") {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("Could not read file"));
      r.readAsDataURL(file);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width || 1);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unsupported"));
      ctx.drawImage(img, 0, 0, w, h);
      // WebP keeps transparency (logos/PNGs) at a smaller size; else JPEG.
      const type =
        file.type === "image/png" || file.type === "image/webp"
          ? "image/webp"
          : "image/jpeg";
      resolve(canvas.toDataURL(type, quality));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = URL.createObjectURL(file);
  });
}

// Humanize a key into a label: "freeShipThresholdCents" -> "Free Ship Threshold ($)".
export function humanize(key: string): string {
  if (typeof key !== "string") return String(key);
  const isMoney = key.endsWith("Cents");
  const base = key.replace(/Cents$/, "");
  const words = base
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .trim();
  const title = words.charAt(0).toUpperCase() + words.slice(1);
  return isMoney ? `${title} ($)` : title;
}

const ASSET_KEY = /image|cover|logo|video|photo|slide|src|icon/i;

const inputClass =
  "w-full rounded-[8px] border border-[rgba(26,23,20,0.22)] bg-paper px-[12px] py-[9px] font-body text-[14px] text-ink outline-none transition-colors focus:border-gold";
const labelClass = "flex flex-col gap-[5px] text-[12px] text-muted";

/** A blank value matching the shape of `v` (for new array rows). */
export function blankLike(v: unknown): unknown {
  if (Array.isArray(v)) return [];
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) out[k] = blankLike(val);
    return out;
  }
  if (typeof v === "number") return 0;
  if (typeof v === "boolean") return false;
  return "";
}

/** Image field: live preview + drag-and-drop upload + path/picker fallback. */
function ImageField({
  value,
  onChange,
  assets,
}: {
  value: string;
  onChange: (v: string) => void;
  assets: Assets;
}) {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      onChange(await fileToDataUrl(file));
    } catch {
      /* ignore unreadable files */
    } finally {
      setBusy(false);
    }
  };

  const isData = value.startsWith("data:");

  return (
    <div className="flex items-start gap-[12px]">
      <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-ink/15 bg-paper">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="text-[10px] text-muted">none</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[6px]">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex cursor-pointer items-center justify-center rounded-[8px] border border-dashed px-[12px] py-[10px] text-center text-[12px] transition-colors ${
            drag
              ? "border-gold bg-gold/[0.08] text-ink"
              : "border-ink/25 text-muted hover:border-gold/60"
          }`}
        >
          {busy ? "Processing…" : drag ? "Drop to upload" : "Drag an image here, or click to upload"}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          className={inputClass}
          list={listId}
          placeholder="/path.jpg or https://…"
          value={isData ? "" : value}
          onChange={(e) => onChange(e.target.value)}
        />
        <datalist id={listId}>
          {assets.images.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
        {isData && (
          <span className="text-[11px] text-muted">
            Uploaded image embedded.{" "}
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-gold underline"
            >
              clear
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

export function FieldEditor({
  value,
  path,
  onChange,
  assets,
  label,
}: {
  value: unknown;
  path: Path;
  onChange: (path: Path, value: unknown) => void;
  assets: Assets;
  label?: string;
}) {
  const key = String(path[path.length - 1] ?? "");

  // ── Arrays ────────────────────────────────────────────────
  if (Array.isArray(value)) {
    const itemsAreObjects =
      value.length > 0 && typeof value[0] === "object" && value[0] !== null;
    const sample = value[0] ?? "";
    const addRow = () => onChange(path, [...value, blankLike(sample)]);
    const removeRow = (i: number) =>
      onChange(path, value.filter((_, j) => j !== i));

    return (
      <fieldset className="m-0 flex flex-col gap-[10px] rounded-[8px] border border-ink/10 p-[14px]">
        <legend className="px-[6px] font-display text-[12px] uppercase tracking-[0.12em] text-ink">
          {label ?? humanize(key)}
        </legend>
        {value.map((item, i) => (
          <div key={i} className="flex items-start gap-[8px]">
            <div className="flex-1">
              {itemsAreObjects ? (
                <div className="rounded-[8px] bg-paper/60 p-[10px]">
                  <FieldEditor
                    value={item}
                    path={[...path, i]}
                    onChange={onChange}
                    assets={assets}
                    label={`#${i + 1}`}
                  />
                </div>
              ) : isImageKey(key) ? (
                <ImageField
                  value={String(item ?? "")}
                  onChange={(v) => onChange([...path, i], v)}
                  assets={assets}
                />
              ) : (
                <input
                  className={inputClass}
                  value={String(item ?? "")}
                  onChange={(e) => onChange([...path, i], e.target.value)}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="mt-[2px] shrink-0 rounded-[6px] border border-ink/15 px-[9px] py-[7px] text-[12px] text-muted transition-colors hover:bg-ink/[0.05]"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="self-start rounded-full border border-gold/40 px-[14px] py-[6px] font-display text-[12px] text-gold transition-colors hover:bg-gold/[0.08]"
        >
          + Add
        </button>
      </fieldset>
    );
  }

  // ── Objects ───────────────────────────────────────────────
  if (value && typeof value === "object") {
    return (
      <fieldset className="m-0 flex flex-col gap-[12px] rounded-[8px] border border-ink/10 p-[clamp(12px,2vw,18px)]">
        <legend className="px-[6px] font-display text-[12px] uppercase tracking-[0.16em] text-ink">
          {label ?? humanize(key)}
        </legend>
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <Fragment key={k}>
            <FieldEditor value={v} path={[...path, k]} onChange={onChange} assets={assets} />
          </Fragment>
        ))}
      </fieldset>
    );
  }

  // ── Scalars ───────────────────────────────────────────────
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-[8px] text-[13px] text-ink-soft">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(path, e.target.checked)}
        />
        {humanize(key)}
      </label>
    );
  }

  if (typeof value === "number") {
    const isMoney = key.endsWith("Cents");
    return (
      <label className={labelClass}>
        {humanize(key)}
        <input
          type="number"
          step={isMoney ? "0.01" : "1"}
          className={inputClass}
          value={isMoney ? (value / 100).toString() : String(value)}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(path, isMoney ? Math.round((Number.isFinite(n) ? n : 0) * 100) : n);
          }}
        />
      </label>
    );
  }

  // string
  const str = String(value ?? "");

  // Image fields get the preview + drag-and-drop uploader.
  if (isImageKey(key)) {
    return (
      <label className={labelClass}>
        {humanize(key)}
        <ImageField value={str} onChange={(v) => onChange(path, v)} assets={assets} />
      </label>
    );
  }

  const isAsset = ASSET_KEY.test(key);
  const listId = isAsset ? `assets-${path.join("-")}` : undefined;
  const long = str.length > 60 || str.includes("\n");
  return (
    <label className={labelClass}>
      {humanize(key)}
      {long ? (
        <textarea
          rows={Math.min(8, Math.max(2, str.split("\n").length))}
          className={`${inputClass} resize-y`}
          value={str}
          onChange={(e) => onChange(path, e.target.value)}
        />
      ) : (
        <>
          <input
            className={inputClass}
            list={listId}
            value={str}
            onChange={(e) => onChange(path, e.target.value)}
          />
          {isAsset && (
            <datalist id={listId}>
              {[...assets.images, ...assets.videos].map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          )}
        </>
      )}
    </label>
  );
}
