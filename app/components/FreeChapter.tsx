"use client";

import { useState } from "react";
import { useSiteContent } from "@/lib/site-content";

export default function FreeChapter() {
  const c = useSiteContent().copy.freeChapter;
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: POST email to list provider (e.g. a /api route → email service).
    setSubmitted(true);
  };

  return (
    <section id="chapter" className="bg-dark px-[clamp(24px,6vw,96px)] py-[clamp(90px,14vh,170px)] text-paper">
      <div className="mx-auto flex max-w-[760px] flex-col items-center gap-[22px] text-center">
        <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold-light">
          {c.eyebrow}
        </span>
        <h2 className="m-0 font-display text-[clamp(32px,4.6vw,58px)] font-normal leading-[1.04] tracking-[-0.02em]">
          {c.headline}
        </h2>
        <p className="mx-0 mt-0 mb-3 max-w-[48ch] text-[clamp(16px,1.4vw,18px)] font-light leading-[1.65] text-paper/[0.74]">
          {c.body}
        </p>

        {!submitted ? (
          <form
            onSubmit={onSubmit}
            className="flex w-full max-w-[540px] flex-wrap justify-center gap-3"
          >
            <input
              type="email"
              required
              placeholder={c.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-[1_1_260px] rounded-full border border-paper/30 bg-transparent px-[22px] py-4 font-body text-[16px] text-paper outline-none transition-colors focus:border-gold-light"
            />
            <button
              type="submit"
              className="flex-none cursor-pointer rounded-full border-none bg-paper px-[30px] py-4 font-body text-[16px] font-semibold text-ink transition-colors hover:bg-white"
            >
              {c.submitLabel}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-[10px] py-2">
            <span className="font-display text-[clamp(20px,2.4vw,28px)] text-gold-light">
              {c.successTitle}
            </span>
            <span className="text-[16px] font-light text-paper/[0.78]">
              {c.successBody}
            </span>
          </div>
        )}

        <span className="mt-[6px] text-[13px] text-paper/[0.45]">
          {c.finePrint}
        </span>
      </div>
    </section>
  );
}
