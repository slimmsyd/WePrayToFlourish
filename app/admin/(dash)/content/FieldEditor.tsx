"use client";

import { Fragment } from "react";

export type Assets = { images: string[]; videos: string[] };

type Path = (string | number)[];

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
