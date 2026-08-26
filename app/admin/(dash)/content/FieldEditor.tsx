"use client";

import { Fragment, useRef, useState } from "react";
import { PRODUCT_TEMPLATE } from "@/site.config";
import {
  getAddLabel,
  getFieldMeta,
  humanize,
  pathKey,
  type Path,
} from "./editor-schema";

export type Assets = { images: string[]; videos: string[] };

const IMAGE_KEY = /image|cover|logo|photo|slide|icon|avatar|thumb|art|banner/i;
const isImageKey = (k: string) => IMAGE_KEY.test(k) && !/alt/i.test(k);

const ASSET_KEY = /image|cover|logo|video|photo|slide|src|icon/i;

const inputClass =
  "w-full rounded-[8px] border border-[rgba(26,23,20,0.22)] bg-paper px-[12px] py-[10px] font-body text-[14px] text-ink outline-none transition-colors duration-200 focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/30";

const labelClass = "flex flex-col gap-[6px]";

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

export { humanize };

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

function FieldLabel({ path, children }: { path: Path; children?: React.ReactNode }) {
  const meta = getFieldMeta(path);
  return (
    <div className={labelClass}>
      <span className="text-[13px] font-medium text-ink">{meta.label}</span>
      {meta.help && (
        <span className="text-[12px] leading-[1.45] text-ink-soft">{meta.help}</span>
      )}
      {children}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  help,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  help?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-[12px] rounded-[8px] border border-ink/10 bg-paper/50 px-[14px] py-[12px] transition-colors duration-200 hover:border-ink/20">
      <div className="flex flex-col gap-[4px]">
        <span className="text-[14px] font-medium text-ink">{label}</span>
        {help && <span className="text-[12px] leading-[1.45] text-ink-soft">{help}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full border-none transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:transition-none ${
          checked ? "bg-gold" : "bg-ink/20"
        }`}
      >
        <span
          className={`absolute top-[3px] left-[3px] h-[20px] w-[20px] rounded-full bg-paper shadow-sm transition-transform duration-200 motion-reduce:transition-none ${
            checked ? "translate-x-[20px]" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function ImageGridPicker({
  assets,
  value,
  onSelect,
}: {
  assets: Assets;
  value: string;
  onSelect: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? assets.images : assets.images.slice(0, 12);

  if (assets.images.length === 0) return null;

  return (
    <div className="flex flex-col gap-[8px]">
      <span className="text-[12px] text-muted">Choose from site images</span>
      <div className="grid grid-cols-4 gap-[6px] sm:grid-cols-5">
        {shown.map((img) => {
          const selected = value === img;
          return (
            <button
              key={img}
              type="button"
              onClick={() => onSelect(img)}
              title={img}
              className={`aspect-square cursor-pointer overflow-hidden rounded-[6px] border-2 bg-paper transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold ${
                selected ? "border-gold ring-2 ring-gold/30" : "border-ink/10 hover:border-gold/50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          );
        })}
      </div>
      {assets.images.length > 12 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="cursor-pointer self-start font-display text-[12px] text-gold transition-colors duration-200 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {expanded ? "Show fewer" : `Show all ${assets.images.length} images`}
        </button>
      )}
    </div>
  );
}

function ImageField({
  value,
  onChange,
  assets,
  path,
}: {
  value: string;
  onChange: (v: string) => void;
  assets: Assets;
  path: Path;
}) {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isData = value.startsWith("data:");

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      onChange(await fileToDataUrl(file));
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  return (
    <FieldLabel path={path}>
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-start gap-[14px]">
          <div className="flex h-[96px] w-[96px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-ink/15 bg-paper">
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="h-full w-full object-contain" />
            ) : (
              <span className="text-[11px] text-muted">No image</span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-[8px]">
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
              className={`flex min-h-[72px] cursor-pointer items-center justify-center rounded-[8px] border border-dashed px-[12px] py-[14px] text-center text-[13px] transition-colors duration-200 ${
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
            {!isData && (
              <input
                className={inputClass}
                placeholder="/path.jpg or https://…"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
            {isData && (
              <span className="text-[12px] text-muted">
                Image uploaded.{" "}
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="cursor-pointer text-gold underline transition-colors hover:text-ink"
                >
                  Remove
                </button>
              </span>
            )}
          </div>
        </div>
        <ImageGridPicker assets={assets} value={isData ? "" : value} onSelect={onChange} />
      </div>
    </FieldLabel>
  );
}

function MoneyInput({
  path,
  value,
  onChange,
}: {
  path: Path;
  value: number;
  onChange: (path: Path, value: unknown) => void;
}) {
  const meta = getFieldMeta(path);
  return (
    <label className={labelClass}>
      <span className="text-[13px] font-medium text-ink">{meta.label}</span>
      {meta.help && (
        <span className="text-[12px] leading-[1.45] text-ink-soft">{meta.help}</span>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-[12px] -translate-y-1/2 text-[14px] text-muted">
          $
        </span>
        <input
          type="number"
          step="0.01"
          min="0"
          className={`${inputClass} pl-[28px]`}
          value={(value / 100).toString()}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(path, Math.round((Number.isFinite(n) ? n : 0) * 100));
          }}
        />
      </div>
    </label>
  );
}

function ScalarField({
  value,
  path,
  onChange,
  assets,
}: {
  value: unknown;
  path: Path;
  onChange: (path: Path, value: unknown) => void;
  assets: Assets;
}) {
  const key = String(path[path.length - 1] ?? "");

  if (typeof value === "boolean") {
    const meta = getFieldMeta(path);
    return (
      <ToggleSwitch
        checked={value}
        onChange={(v) => onChange(path, v)}
        label={meta.label}
        help={meta.help}
      />
    );
  }

  if (typeof value === "number") {
    if (key.endsWith("Cents")) {
      return <MoneyInput path={path} value={value} onChange={onChange} />;
    }
    const meta = getFieldMeta(path);
    return (
      <label className={labelClass}>
        <span className="text-[13px] font-medium text-ink">{meta.label}</span>
        {meta.help && (
          <span className="text-[12px] leading-[1.45] text-ink-soft">{meta.help}</span>
        )}
        <input
          type="number"
          step="1"
          className={inputClass}
          value={String(value)}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(path, Number.isFinite(n) ? n : 0);
          }}
        />
      </label>
    );
  }

  const str = String(value ?? "");

  if (isImageKey(key)) {
    return (
      <ImageField
        value={str}
        onChange={(v) => onChange(path, v)}
        assets={assets}
        path={path}
      />
    );
  }

  const meta = getFieldMeta(path);
  const isAsset = ASSET_KEY.test(key);
  const listId = isAsset ? `assets-${pathKey(path)}` : undefined;
  const long = str.length > 60 || str.includes("\n");
  const idPlaceholder = key === "id" ? "e.g. 52-laws-of-you" : undefined;

  return (
    <label className={labelClass}>
      <span className="text-[13px] font-medium text-ink">{meta.label}</span>
      {meta.help && (
        <span className="text-[12px] leading-[1.45] text-ink-soft">{meta.help}</span>
      )}
      {long ? (
        <textarea
          rows={Math.min(8, Math.max(3, str.split("\n").length))}
          className={`${inputClass} min-h-[80px] resize-y leading-[1.5]`}
          value={str}
          onChange={(e) => onChange(path, e.target.value)}
        />
      ) : (
        <>
          <input
            className={inputClass}
            list={listId}
            placeholder={idPlaceholder}
            value={str}
            onChange={(e) => onChange(path, e.target.value)}
          />
          {isAsset && listId && (
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

export function FieldEditor({
  value,
  path,
  onChange,
  assets,
  label,
  flat = false,
  depth = 0,
  hideKeys,
}: {
  value: unknown;
  path: Path;
  onChange: (path: Path, value: unknown) => void;
  assets: Assets;
  label?: string;
  flat?: boolean;
  depth?: number;
  hideKeys?: string[];
}) {
  const key = String(path[path.length - 1] ?? "");

  // ── Arrays ────────────────────────────────────────────────
  if (Array.isArray(value)) {
    const itemsAreObjects =
      value.length > 0 && typeof value[0] === "object" && value[0] !== null;
    const sample = value[0] ?? (key === "products" ? PRODUCT_TEMPLATE : "");
    const addRow = () =>
      onChange(path, [
        ...value,
        key === "products"
          ? { ...PRODUCT_TEMPLATE, featured: value.length === 0 }
          : blankLike(sample),
      ]);
    const removeRow = (i: number) =>
      onChange(path, value.filter((_, j) => j !== i));

    const arrayMeta = getFieldMeta(path);
    const showArrayHeader = depth > 0 || !flat;

    return (
      <div className="flex flex-col gap-[12px]">
        {showArrayHeader && (
          <div className="flex flex-col gap-[4px]">
            <span className="font-display text-[14px] font-medium text-ink">
              {label ?? arrayMeta.label}
            </span>
            {arrayMeta.help && (
              <span className="text-[12px] text-ink-soft">{arrayMeta.help}</span>
            )}
          </div>
        )}
        {value.map((item, i) => {
          const rowLabel =
            key === "products" &&
            item &&
            typeof item === "object" &&
            "title" in item
              ? String((item as { title?: string; id?: string }).title || "") ||
                String((item as { id?: string }).id || "") ||
                `Item ${i + 1}`
              : `${arrayMeta.label || humanize(key)} ${i + 1}`;
          return (
            <div
              key={i}
              className="rounded-[10px] border border-ink/10 bg-panel/30 p-[14px]"
            >
              <div className="mb-[12px] flex items-center justify-between gap-[8px]">
                <span className="font-display text-[13px] font-medium text-ink">{rowLabel}</span>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="cursor-pointer rounded-[6px] border border-ink/15 px-[10px] py-[5px] text-[12px] text-muted transition-colors duration-200 hover:bg-ink/[0.05] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold"
                >
                  Remove
                </button>
              </div>
              {itemsAreObjects ? (
                <FieldEditor
                  value={item}
                  path={[...path, i]}
                  onChange={onChange}
                  assets={assets}
                  flat
                  depth={depth + 1}
                />
              ) : isImageKey(key) ? (
                <ImageField
                  value={String(item ?? "")}
                  onChange={(v) => onChange([...path, i], v)}
                  assets={assets}
                  path={[...path, i]}
                />
              ) : (
                <input
                  className={inputClass}
                  value={String(item ?? "")}
                  onChange={(e) => onChange([...path, i], e.target.value)}
                />
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={addRow}
          className="cursor-pointer self-start rounded-full border border-gold/40 px-[16px] py-[8px] font-display text-[13px] text-gold transition-colors duration-200 hover:bg-gold/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {getAddLabel(path)}
        </button>
      </div>
    );
  }

  // ── Objects ───────────────────────────────────────────────
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([k]) => !hideKeys?.includes(k),
    );
    const objMeta = getFieldMeta(path);
    const showObjHeader = depth > 0 && label;

    return (
      <div className="flex flex-col gap-[16px]">
        {showObjHeader && (
          <div className="border-b border-ink/10 pb-[8px]">
            <span className="font-display text-[13px] font-medium text-ink">
              {label ?? objMeta.label}
            </span>
          </div>
        )}
        {entries.map(([k, v], idx) => (
          <Fragment key={k}>
            {idx > 0 && depth === 0 && flat && <hr className="border-ink/10" />}
            {v !== null && typeof v === "object" && !Array.isArray(v) ? (
              <FieldEditor
                value={v}
                path={[...path, k]}
                onChange={onChange}
                assets={assets}
                label={getFieldMeta([...path, k]).label}
                flat
                depth={depth + 1}
              />
            ) : (
              <ScalarField
                value={v}
                path={[...path, k]}
                onChange={onChange}
                assets={assets}
              />
            )}
          </Fragment>
        ))}
      </div>
    );
  }

  // ── Scalar at root ────────────────────────────────────────
  return (
    <ScalarField value={value} path={path} onChange={onChange} assets={assets} />
  );
}
