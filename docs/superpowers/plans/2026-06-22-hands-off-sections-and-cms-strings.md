# Hands-off: Section Show/Hide + CMS-Editable Strings — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the client show/hide each content section and edit the last hardcoded customer-facing strings from `/admin/content`, with no developer involvement.

**Architecture:** The generic recursive editor at `/admin/content` renders a UI for every key in `SiteConfig` automatically (objects → cards, booleans → labeled checkboxes, strings → text fields), so the entire feature is delivered by (1) extending the typed config in `site.config.ts` and (2) consuming the new keys in `page.tsx` and two components. No editor code changes. `getSiteContent()` deep-merges the DB over the defaults, so existing live content inherits the new defaults automatically.

**Tech Stack:** Next.js 16.2.9 (modified — see AGENTS.md), React 19, TypeScript 5, Tailwind 4, Neon Postgres.

## Global Constraints

- Prices are in **cents**; the server (Stripe intent route via `lib/pricing.ts`) is the only pricing authority — do not move price math into editable copy. The shipping line's `$X` stays server-computed.
- New config fields must be **seeded with the current exact wording** so the rendered site is byte-identical until the client edits.
- `sections` defaults are **all `true`**.
- Header and footer are structural — **not** toggleable.
- No section **reordering**; show/hide only.
- No automated test runner exists. The verification gate per task is: `npx tsc --noEmit` passes, then `npm run lint` and `npm run build` pass.
- This is a modified Next.js: consult `node_modules/next/dist/docs/` before changing server-component / revalidation behavior. `saveContentAction` already calls `revalidatePath("/")` and `revalidatePath("/checkout")`, which covers content refresh.
- `validateShape` (in `app/admin/actions.ts`) already handles booleans (`return Boolean(value)`) and strings; the new fields need no validator changes.

---

### Task 1: Extend the config schema + defaults

Adds the `sections` toggle block, the new `copy.art` block, and three new `copy.checkout` fields — type definitions and seeded defaults. After this task TypeScript knows the new fields exist and they appear automatically in `/admin/content`; nothing consumes them yet.

**Files:**
- Modify: `site.config.ts` (the `SiteConfig` type ~lines 36-113, and the `site` object ~lines 115-253)

**Interfaces:**
- Produces:
  - `SiteConfig["sections"]`: `{ hero: boolean; art: boolean; quote: boolean; aboutBook: boolean; aboutAuthor: boolean; freeChapter: boolean; community: boolean }`
  - `SiteConfig["copy"]["art"]`: `{ label: string }`
  - `SiteConfig["copy"]["checkout"]`: existing `{ summaryItemNote, successTitle, successBody }` **plus** `pageTitle: string; securityNote: string; shippingNote: string`

- [ ] **Step 1: Add `sections` to the `SiteConfig` type**

In `site.config.ts`, add a `sections` field as the **first** member of the `SiteConfig` type (immediately after the opening `export type SiteConfig = {`):

```ts
export type SiteConfig = {
  sections: {
    hero: boolean;
    art: boolean;
    quote: boolean;
    aboutBook: boolean;
    aboutAuthor: boolean;
    freeChapter: boolean;
    community: boolean;
  };
  brand: {
    siteName: string;
    domain: string;
    logo: string;
    logoAlt: string;
  };
```

- [ ] **Step 2: Add the `art` block to the `copy` type**

In the `copy:` section of the `SiteConfig` type, add an `art` member just before `quote`:

```ts
  copy: {
    hero: {
      /** Headline lines — each renders on its own line. */
      headline: string[];
      /** Full-bleed cross-fade background slides from /public. */
      slides: string[];
      primaryCta: { label: string; href: string };
      secondaryCta: { label: string; href: string };
      /** Darkness of the gradient overlay (0–1). */
      overlay: number;
      /** Slide rotation interval in milliseconds. */
      intervalMs: number;
    };
    art: {
      /** Label above the Instagram art marquee. */
      label: string;
    };
    quote: {
```

- [ ] **Step 3: Add the three new fields to the `checkout` copy type**

In the `copy.checkout` member of the `SiteConfig` type, extend it to:

```ts
    checkout: {
      /** Checkout page <h1>. */
      pageTitle: string;
      summaryItemNote: string;
      successTitle: string;
      successBody: string;
      /** Trust line under the Pay button. */
      securityNote: string;
      /** Shipping reassurance prefix; the "$X" amount is appended by the component. */
      shippingNote: string;
    };
```

- [ ] **Step 4: Seed the `sections` default (all true)**

In the `site` object, add `sections` as the **first** property (immediately after `export const site: SiteConfig = {`):

```ts
export const site: SiteConfig = {
  sections: {
    hero: true,
    art: true,
    quote: true,
    aboutBook: true,
    aboutAuthor: true,
    freeChapter: true,
    community: true,
  },

  brand: {
```

- [ ] **Step 5: Seed the `copy.art` default**

In the `site` object's `copy:`, add `art` just before `quote:` (the label is the current ArtCarousel text):

```ts
    art: {
      label: "Instagram",
    },
```

- [ ] **Step 6: Seed the three new checkout defaults**

Update the `copy.checkout` default in the `site` object to include the new fields with their current exact wording:

```ts
    checkout: {
      pageTitle: "Complete your order",
      summaryItemNote: "Includes free first chapter",
      successTitle: "Thank you. Your order is in.",
      successBody:
        "A confirmation is on its way to your inbox. 52 Laws of You will ship shortly, and your free first chapter is included as a digital download.",
      securityNote: "Secure encrypted checkout, powered by Stripe.",
      shippingNote: "Free worldwide shipping over",
    },
```

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no errors). The `site` object now satisfies the extended `SiteConfig` type — proving every new typed field has a seeded default.

- [ ] **Step 8: Commit**

```bash
git add site.config.ts
git commit -m "feat(cms): add section toggles + art/checkout copy fields to config"
```

---

### Task 2: Gate the content sections in `page.tsx`

Makes the home page read `sections` and conditionally render each of the 7 content sections. Header/footer stay always-on.

**Files:**
- Modify: `app/page.tsx` (entire file, currently lines 1-25)

**Interfaces:**
- Consumes: `SiteConfig["sections"]` (Task 1) via `getSiteContent()` from `@/lib/content`.

- [ ] **Step 1: Rewrite `page.tsx` as an async server component that gates each section**

Replace the entire contents of `app/page.tsx` with:

```tsx
import { getSiteContent } from "@/lib/content";
import SiteHeader from "./components/SiteHeader";
import Hero from "./components/Hero";
import ArtCarousel from "./components/ArtCarousel";
import Quote from "./components/Quote";
import AboutBook from "./components/AboutBook";
import AboutAuthor from "./components/AboutAuthor";
import FreeChapter from "./components/FreeChapter";
import Community from "./components/Community";
import SiteFooter from "./components/SiteFooter";

export default async function WePrayToFlourish() {
  const { sections } = await getSiteContent();
  return (
    <>
      <SiteHeader />
      {sections.hero && <Hero />}
      {sections.art && <ArtCarousel />}
      {sections.quote && <Quote />}
      {sections.aboutBook && <AboutBook />}
      {sections.aboutAuthor && <AboutAuthor />}
      {sections.freeChapter && <FreeChapter />}
      {sections.community && <Community />}
      <SiteFooter />
    </>
  );
}
```

Note: `getSiteContent()` is `server-only` and React-`cache()`d, so this call dedups with the calls the section components already make. `ArtCarousel` keeps its own "return null when no Instagram tiles" behavior, which composes with the `sections.art` gate.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(cms): show/hide each content section from the sections config"
```

---

### Task 3: Consume the new strings in the components

Wires the four new copy fields into `ArtCarousel` and `Checkout` so the hardcoded strings come from the CMS.

**Files:**
- Modify: `app/components/ArtCarousel.tsx:61`
- Modify: `app/checkout/Checkout.tsx:115` (page title), `:358` (security note), `:476` (shipping note)

**Interfaces:**
- Consumes: `SiteConfig["copy"]["art"].label` and `SiteConfig["copy"]["checkout"].{pageTitle,securityNote,shippingNote}` (Task 1).

- [ ] **Step 1: Use the art label in `ArtCarousel`**

In `app/components/ArtCarousel.tsx`, replace the hardcoded `Instagram` label (line 61). The component already has `const site = await getSiteContent();`. Change:

```tsx
          Instagram <span className="font-normal">&#8599;</span>
```

to:

```tsx
          {site.copy.art.label} <span className="font-normal">&#8599;</span>
```

- [ ] **Step 2: Use the page title in `Checkout`**

In `app/checkout/Checkout.tsx`, the outer `Checkout` component already has `const site = useSiteContent();`. Replace the `<h1>` body (line 115):

```tsx
          Complete your order
```

with:

```tsx
          {site.copy.checkout.pageTitle}
```

- [ ] **Step 3: Use the security note in `CheckoutBody`**

In `CheckoutBody` (which receives the `checkout` prop of type `CheckoutCopy`), replace the trust line (line 358):

```tsx
            Secure encrypted checkout, powered by Stripe.
```

with:

```tsx
            {checkout.securityNote}
```

- [ ] **Step 4: Use the shipping note in `CheckoutBody`**

Replace the shipping reassurance line (line 476), keeping the server-computed `$X` amount:

```tsx
          <span className="text-gold">&#10022;</span> Free worldwide shipping
          over {fmt(freeShipAt)}
```

with:

```tsx
          <span className="text-gold">&#10022;</span> {checkout.shippingNote}{" "}
          {fmt(freeShipAt)}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Lint and build**

Run: `npm run lint && npm run build`
Expected: both PASS. (Build does not require env vars at import — commit 86ded2a made env access lazy.)

- [ ] **Step 7: Commit**

```bash
git add app/components/ArtCarousel.tsx app/checkout/Checkout.tsx
git commit -m "feat(cms): make checkout title/trust/shipping + art label CMS-editable"
```

---

### Task 4: Manual verification in the running app

No automated test covers admin UI behavior, so verify by hand.

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Open `http://localhost:3000` and confirm the site renders identically to before (defaults preserve all copy and show all sections).

- [ ] **Step 2: Verify the Sections card**

Log in at `/admin/login` (dev password `flourish-admin`), go to `/admin/content`. Confirm a **"Sections"** card appears first with 7 labeled checkboxes: Hero, Art, Quote, About Book, About Author, Free Chapter, Community — all checked.

- [ ] **Step 3: Verify show/hide**

Uncheck "Community", Save, reload `/` → the Community section is gone. Re-check it, Save, reload → it returns. Repeat for one more section (e.g. Quote) to confirm the gate is wired for all.

- [ ] **Step 4: Verify the editable strings**

In `/admin/content`: under the **Art** card edit "Label"; under the **Checkout** card edit "Page Title", "Security Note", and "Shipping Note". Save. Confirm:
- `/` shows the new art label above the Instagram marquee.
- `/checkout` shows the new `<h1>`, the new trust line under the Pay button, and the new shipping line — and that the shipping line still shows the correct dollar amount after your edited prefix.

- [ ] **Step 5: Done**

All sections toggle and all four strings are editable from `/admin`. The site is fully hands-off for content.

---

## Self-Review

**Spec coverage:**
- Section show/hide (content sections only; centralized `sections` block; default all true; first card) → Task 1 (Steps 1, 4), Task 2, Task 4 Steps 2-3. ✅
- Header/footer not toggleable → Task 2 (only the 7 content sections gated). ✅
- Checkout pageTitle / securityNote / shippingNote (prefix + server `$X`) → Task 1 (Steps 3, 6), Task 3 (Steps 2-4). ✅
- Instagram label → `copy.art.label` → Task 1 (Steps 2, 5), Task 3 (Step 1). ✅
- Seeded with exact current wording → Task 1 Steps 5-6 use verbatim strings. ✅
- Backward-compat via deep-merge → relies on existing `getSiteContent` behavior; no change needed (noted in plan header). ✅
- Nav not auto-synced (accepted) → intentionally no task. ✅
- Verification → Task 1/2/3 typecheck+lint+build gates, Task 4 manual. ✅

**Placeholder scan:** No TBD/TODO; every code step shows complete code. ✅

**Type consistency:** `sections` keys (hero/art/quote/aboutBook/aboutAuthor/freeChapter/community) match between the type (Task 1 Step 1), the default (Step 4), and the `page.tsx` reads (Task 2). `copy.art.label`, `copy.checkout.{pageTitle,securityNote,shippingNote}` match between type (Steps 2-3), defaults (Steps 5-6), and component reads (Task 3). ✅
