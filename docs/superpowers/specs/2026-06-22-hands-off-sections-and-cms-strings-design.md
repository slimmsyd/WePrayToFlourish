# Hands-off: section show/hide + CMS-editable strings

**Date:** 2026-06-22
**Status:** Approved (design)

## Goal

Close the last two gaps that still require a developer to change the public site,
so the non-technical client can run it entirely from `/admin/content`:

1. Show/hide each content section from the admin.
2. Move the remaining customer-facing hardcoded strings into the CMS.

Out of scope: section **reordering** (show/hide only), nav auto-pruning, and any
change to layout, styling, pricing math, or Stripe integration.

## Background

The site is a single-product store ("52 Laws of You") with a full-site CMS:
`site.config.ts` holds the typed `SiteConfig` defaults; the DB (`site_content`,
JSONB singleton) holds the edited version, deep-merged over the defaults by
`getSiteContent()` (React-cached, server). A generic recursive editor at
`/admin/content` renders a field UI for every key in the config — including
booleans as on/off toggles — so most new content becomes editable just by adding
it to the config shape. `saveContentAction` shape-validates the DB payload
against the defaults before persisting, then `revalidatePath`.

`app/page.tsx` is currently a static server component that renders the section
components in a fixed order. Each section component reads its own content
internally via `getSiteContent()` (server) or `useSiteContent()` (client).

## Design

### 1. Section show/hide — centralized `sections` block

Add one top-level object to `SiteConfig`:

```ts
sections: {
  hero: boolean;
  art: boolean;
  quote: boolean;
  aboutBook: boolean;
  aboutAuthor: boolean;
  freeChapter: boolean;
  community: boolean;
};
```

- Default **all `true`** in `site.config.ts`.
- Place `sections` as the **first key** in `SiteConfig` (type + object) so it is
  the first card the client sees in `/admin/content`.
- Header and footer are structural and are **not** toggleable.

Why centralized (vs. a scattered `enabled` flag per copy block): all toggles live
in one "Sections" card, separating "is it on" from "what does it say." It is the
cleaner mental model and the standard pattern.

**Backward compatibility:** the existing deep-merge means the current DB row
(which has no `sections` key) inherits the all-`true` default automatically. The
live site is unchanged until the client toggles something. Adding `sections` to
the defaults also extends the shape that `saveContentAction` validates against, so
saved payloads including `sections` pass validation.

**`app/page.tsx`** becomes an async server component:

```tsx
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

`getSiteContent()` is React-cached, so the extra call here dedups with the calls
already made inside the section components. `ArtCarousel` keeps its internal
"return null when there are no Instagram tiles" behavior; that composes fine with
the new `sections.art` gate (off → not rendered; on but empty → still null).

### 2. Hardcoded strings → CMS

Four new fields, each seeded with the **current exact wording** so the rendered
site is identical until edited.

| New field | Replaces | File | Current text |
|---|---|---|---|
| `copy.checkout.pageTitle` | checkout `<h1>` | `app/checkout/Checkout.tsx:115` | `Complete your order` |
| `copy.checkout.securityNote` | trust line under Pay button | `app/checkout/Checkout.tsx:358` | `Secure encrypted checkout, powered by Stripe.` |
| `copy.checkout.shippingNote` | shipping reassurance prefix | `app/checkout/Checkout.tsx:476` | `Free worldwide shipping over` |
| `copy.art.label` | Instagram link label | `app/components/ArtCarousel.tsx:61` | `Instagram` |

Notes:
- `shippingNote` stores only the **text prefix**. The component renders
  `{checkout.shippingNote} {fmt(freeShipAt)}`, keeping the `$X` server-computed
  from `product.freeShipThresholdCents` so the displayed amount can never drift
  from the real threshold.
- `copy.art` is a **new copy block** (`{ label: string }`). `ArtCarousel`
  already calls `getSiteContent()`, so it reads `site.copy.art.label` directly;
  the trailing `↗` arrow stays in the markup.
- `Checkout.tsx` already receives `site.copy.checkout` (passed into
  `CheckoutBody`). `pageTitle` is read in the outer `Checkout` component from
  `site.copy.checkout`; `securityNote` and `shippingNote` are read inside
  `CheckoutBody` from the `checkout` prop.

## Known behavior (accepted)

- **Nav not auto-synced.** Hiding the Art or Newsletter section leaves its nav
  link (`#art`, `#chapter`) pointing at a now-absent anchor. Nav is separately
  editable, so the client removes the link themselves. No auto-pruning — YAGNI.

## Verification

No automated test harness exists for the web app. Verify by:

1. `npx tsc --noEmit` (or the project's typecheck) and `next build` pass.
2. In `/admin/content`: toggle each of the 7 sections off, save, confirm it
   disappears from `/`; toggle back on, confirm it returns.
3. Edit each of the 4 new strings, save, confirm the new copy renders on `/` and
   `/checkout` and that the shipping line still shows the correct `$X` amount.

Heed `AGENTS.md`: this is a modified Next.js — consult
`node_modules/next/dist/docs/` before changing server-component / revalidation
behavior. The existing `revalidatePath` in `saveContentAction` already covers
content saves; `page.tsx` becoming async is a standard server component change.
