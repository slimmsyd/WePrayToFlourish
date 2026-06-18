# We Pray To Flourish — Landing Page Design

**Date:** 2026-06-18
**Source:** `/Users/sydneysanders/Desktop/handoff` (52 Laws of You marketing site)
**Stack:** Next.js 16.2.9 (App Router) · React 19 · Tailwind CSS v4

## Goal

Port the handoff design (a framework-free inline-styled HTML page) into the Next.js
App Router as a production-quality, single-route marketing site for the book
*52 Laws of You* by Yaddin. Promote the book and capture free-chapter email signups.

## Decisions

- **Styling:** Idiomatic Tailwind v4. Brand tokens + fonts declared in `globals.css`
  via `@theme`; sections built with Tailwind utilities (arbitrary values reproduce the
  handoff `clamp()` scale). Native `hover:`/`focus:` variants replace the handoff's
  custom `style-hover`/`style-focus` attributes.
- **Email form:** Front-end only. Shows the "Thank you" state on submit; a commented
  stub marks where to wire a real list later. No backend in this scope.
- **Placeholders:** Kept as-is from the handoff (striped art tiles → instagram.com,
  song chips → `#`, community/author photos → styled drop-slots).

## Design System

**Type** (`next/font/google`, self-hosted):
- Display / headlines / labels: **Schibsted Grotesk** (300, 400, 500, 600, 700)
- Body: **Hanken Grotesk** (300, 400, 500, 600)
- Headlines: weight 300–400, tracking `-0.02em`. Small labels: UPPERCASE,
  `letter-spacing: 0.34em`, gold.

**Color tokens** (Tailwind `@theme`):

| Token        | Hex       | Use                              |
|--------------|-----------|----------------------------------|
| `paper`      | `#F6F2EA` | Primary light background         |
| `panel`      | `#EFE9DD` | Alternating section background    |
| `ink`        | `#1A1714` | Primary text / dark elements     |
| `ink-soft`   | `#4A443C` | Body copy                        |
| `muted`      | `#857D72` | Footer fine print                |
| `gold`       | `#9C7B4D` | Accent (labels, links, dividers) |
| `gold-light` | `#D8B27C` | Accent on dark backgrounds       |
| `dark`       | `#16130F` | Email/CTA band, hero base        |

**Direction:** minimal, gallery-like, generous whitespace. Light & airy with the dark
painting as the dominant accent. No em dashes anywhere (commas / periods / colons only).

## Architecture

```
app/
  layout.tsx        fonts (CSS vars on <html>) + metadata (title, description, OG)
  page.tsx          server component; composes sections top→bottom
  globals.css       @theme tokens, base styles, ::selection, smooth scroll
  components/
    SiteHeader.tsx       static — sticky white nav, logo, links, social/cart icons
    Hero.tsx             "use client" — 3-layer crossfade slider + dots
    ArtCarousel.tsx      static — horizontal scroll-snap striped tiles
    Quote.tsx            static — Law 12 pull-quote
    AboutBook.tsx        static — cover image + copy + Observe · Restrain · Flourish
    AboutAuthor.tsx      static — bio + "Listen" song-chip carousel
    FreeChapter.tsx      "use client" — email form → thank-you state
    Community.tsx        static — 3 photo drop-slots with captions
    SiteFooter.tsx       static — wordmark, nav, copyright
public/
  hero.jpg, cover.jpg, logo.jpg   copied from handoff/assets
```

## Components

Each section is a self-contained component with no props (content is static to the
page) except where interactivity requires local state. The page composes them in order.

### Server components (static layout)
`SiteHeader`, `ArtCarousel`, `Quote`, `AboutBook`, `AboutAuthor`, `Community`,
`SiteFooter`. Pure markup + Tailwind classes. Anchor links (`#book`, `#author`,
`#art`, `#chapter`, `#community`, `#top`) drive in-page navigation; `scroll-behavior:smooth`.

### Client island: `Hero`
Ports the handoff's DC logic:
- `useState` for `slide` (0–2).
- `useEffect` installs a 5s `setInterval` that advances `slide = (slide + 1) % 3`,
  cleaned up on unmount.
- Three absolutely-positioned layers cross-fade via `opacity` + `transition:
  opacity 1.6s ease-in-out`; active layer raised in `z-index`.
- Dot buttons (bottom-right) call `goTo(i)`: reset slide and restart the timer.
- Gradient overlay reproduced at the handoff default (`heroOverlay = 0.55`).
- All three layers use `/hero.jpg` for now (placeholder, per handoff).

### Client island: `FreeChapter`
- `useState` for `email` and `submitted`.
- On submit (`preventDefault`): if email is non-empty, set `submitted = true` and
  swap the form for the "Thank you. Check your inbox." block.
- Commented stub `// TODO: POST email to list provider` marks the wiring point.

## Data Flow & State

No global state, no data fetching. Two components hold isolated local state (`Hero`
slider index; `FreeChapter` email + submitted). Everything else is static.

## Error Handling

Minimal surface: the only input is the email field, guarded by `type="email"`,
`required`, and a non-empty check before showing the thank-you state. No network
calls in scope, so no fetch error handling yet.

## Testing / Verification

- `npm run build` succeeds with no type or lint errors.
- `npm run dev` renders the page; manual check: hero auto-advances and dots work;
  email submit shows the thank-you state; layout matches the handoff at desktop and
  mobile widths.

## Out of Scope

- The `image-slot` drag-drop editor component and `support.js` (authoring-tool runtime).
- Real email backend, real social/checkout URLs, real artwork/photos/song links.
