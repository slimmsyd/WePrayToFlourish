# How to use — We Pray to Flourish

A single-product book store (**52 Laws of You** by Yaddin) built on Next.js 16,
with Stripe payments, a Neon Postgres database, and an admin CRM so the content
owner can edit the product, pricing, and copy without touching code.

> ⚠️ This repo uses a **modified Next.js 16** — APIs can differ from the public
> docs. The source of truth is `node_modules/next/dist/docs/`. See
> `AGENTS.md`. Notably: middleware is `proxy.ts`, `cookies()` is async, and
> `revalidateTag` takes a second argument.

---

## 1. First-time setup

### a. Install dependencies
```bash
npm install
```

### b. Create your env file
Copy the template and fill it in (`.env.local` is gitignored):
```bash
cp .env.example .env.local
```
Fill in:

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string (Neon console → Connection string). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe **test** publishable key (`pk_test_…`). |
| `STRIPE_SECRET_KEY` | Stripe **test** secret key (`sk_test_…`). |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` (local) or the Dashboard. Optional locally. |
| `NEXT_PUBLIC_SITE_URL` | Base URL, e.g. `http://localhost:3000`. |
| `SESSION_SECRET` | Signs the admin cookie. Generate: `openssl rand -hex 32`. |
| `ADMIN_PASSWORD` | The admin login password (dev). Prefer `ADMIN_PASSWORD_HASH` in prod. |

Generate a password hash for production (so the plaintext isn't in env):
```bash
node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" 'your-password'
```
Set the result as `ADMIN_PASSWORD_HASH` and remove `ADMIN_PASSWORD`.

### c. Create the database tables
Creates `orders` + `site_content` and seeds default product content (idempotent —
safe to re-run, never clobbers edits):
```bash
node --env-file=.env.local scripts/db-init.mjs
```

### d. Run it
```bash
npm run dev      # http://localhost:3000
```

---

## 2. The admin CRM

Open **`/admin/login`**, sign in with your `ADMIN_PASSWORD`.

- **Dashboard** (`/admin`) — overview + links.
- **Product & pricing** (`/admin/product`) — edit the title, author, format,
  tagline, **price / shipping / free-ship threshold / tax / currency / max qty**
  (enter prices in dollars; stored as cents), cover image + hover video (pick a
  file already in `/public` or paste a URL), short + long description, and tags.
  Click **Save changes** — it publishes live immediately. The price you set here
  is exactly what Stripe charges.
- **Orders** (`/admin/orders`) — read-only list of paid orders (customer,
  address, qty, total, status, date), newest first.
- **Log out** — top-right.

### How content flows
- Product content lives as one JSONB row in the `site_content` table.
- The public site (`/`, `/checkout`) and the Stripe charge route all read from
  it. Pricing is **always computed server-side** — the browser can never dictate
  the amount.
- Saving calls `revalidatePath` so the static pages refresh.

---

## 3. Taking a test payment

1. Make sure Stripe **test** keys are in `.env.local`.
2. Add a book to the cart and go to `/checkout`.
3. Use Stripe's test card: **4242 4242 4242 4242**, any future expiry, any CVC,
   any ZIP.
4. The order appears in **`/admin/orders`**.

For the production-grade webhook path locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# paste the printed whsec_… into STRIPE_WEBHOOK_SECRET
```

---

## 4. Project map

```
app/
  page.tsx                 Public landing page (reads product content)
  checkout/                Checkout page + Stripe Payment Element
  admin/                   The CRM (login + (dash) route group)
    login/                 Password login
    (dash)/                Gated dashboard, product editor, orders
    actions.ts             Server Actions: login, logout, save product
  api/
    checkout/intent        Creates the Stripe PaymentIntent (pricing authority)
    checkout/order         Records the order after payment
    stripe/webhook         Stripe webhook → persists orders
lib/
  content.ts               Product content model + DB read/write
  pricing.ts               priceFor(qty, pricing) — charge math (cents)
  db.ts                    Neon client
  stripe.ts / stripe-client.ts   Stripe server + browser
  auth.ts / auth-server.ts Admin session (HMAC cookie) + guards
  orders.ts                Orders table + queries
proxy.ts                   Gates /admin/* and /api/admin/*
scripts/db-init.mjs        Create + seed tables
```

---

## 5. Reusing this as a template for another book

No credentials live in code, so rebranding is config-only:
1. Copy the repo.
2. Set new `DATABASE_URL`, Stripe keys, `SESSION_SECRET`, and `ADMIN_PASSWORD`
   in the new `.env.local`.
3. `node --env-file=.env.local scripts/db-init.mjs` to create + seed tables.
4. Edit the seed defaults in `scripts/db-init.mjs` and `lib/content.ts`
   (`DEFAULT_PRODUCT`) for the new book, or just edit everything in `/admin`.

---

## 6. Scope notes

This iteration makes **product + commerce** fields and the **orders** view
editable. Marketing copy (the big hero headline, community section, SEO) is still
hardcoded in components and becomes DB-driven in a later iteration by adding more
slices to the `site_content` document.
