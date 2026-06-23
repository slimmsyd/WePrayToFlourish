// Exercise the newsletter signup flow (DB + Resend welcome + admin alert).
//
// Usage:
//   node --env-file=.env.local scripts/test-newsletter.mjs [email]
//   node --env-file=.env.local scripts/test-newsletter.mjs --direct [email]
//
// Requires the dev server for the default (API) mode:
//   npm run dev
//
// --direct calls Resend + Neon without HTTP (handy when the server is down).

import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

const args = process.argv.slice(2);
const direct = args.includes("--direct");
const emailArg = args.find((a) => a !== "--direct");

const email =
  emailArg ||
  process.env.TEST_NEWSLETTER_EMAIL ||
  process.env.ADMIN_NOTIFICATION_EMAIL;

const base =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

if (!email) {
  console.error(
    "✗ No email. Pass one as an argument or set TEST_NEWSLETTER_EMAIL / ADMIN_NOTIFICATION_EMAIL.",
  );
  console.error(
    "  node --env-file=.env.local scripts/test-newsletter.mjs you@email.com",
  );
  process.exit(1);
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`✗ ${name} is not set in .env.local`);
    process.exit(1);
  }
  return value;
}

async function viaApi() {
  console.log(`→ POST ${base}/api/newsletter`);
  console.log(`  email: ${email}`);

  let res;
  try {
    res = await fetch(`${base}/api/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch (err) {
    console.error("✗ Could not reach the API. Is the dev server running?");
    console.error("  npm run dev");
    console.error(`  (${err.message})`);
    process.exit(1);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`✗ API ${res.status}:`, data.error || data);
    process.exit(1);
  }

  console.log("✓ Newsletter signup succeeded via API");
  console.log("  Check inbox:", email);
  console.log("  Admin alert:", process.env.ADMIN_NOTIFICATION_EMAIL || "(ADMIN_NOTIFICATION_EMAIL)");
}

async function viaDirect() {
  const apiKey = requireEnv("RESEND_API_KEY");
  const from = requireEnv("RESEND_FROM_EMAIL");
  const admin = requireEnv("ADMIN_NOTIFICATION_EMAIL");
  const dbUrl = requireEnv("DATABASE_URL");

  const sql = neon(dbUrl);
  const resend = new Resend(apiKey);
  const normalized = email.trim().toLowerCase();

  console.log("→ Direct newsletter test (DB + Resend)");
  console.log(`  subscriber: ${normalized}`);
  console.log(`  from: ${from}`);
  console.log(`  admin: ${admin}`);

  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email             TEXT NOT NULL UNIQUE,
      welcome_sent_at   TIMESTAMPTZ,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  const inserted = await sql`
    INSERT INTO newsletter_subscribers (email)
    VALUES (${normalized})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email
  `;

  if (!inserted[0]) {
    console.log("✓ Email already subscribed — skipping send (same as production)");
    process.exit(0);
  }

  const welcome = await resend.emails.send(
    {
      from,
      to: [normalized],
      subject: "[test] Newsletter welcome",
      html: "<p>Direct script test — welcome email placeholder. Stylize in <code>lib/email-templates.ts</code>.</p>",
      text: "Direct script test — welcome email placeholder.",
    },
    { idempotencyKey: `test-newsletter-welcome/${normalized}` },
  );

  if (welcome.error) {
    console.error("✗ Welcome email failed:", welcome.error.message);
    process.exit(1);
  }
  console.log("✓ Welcome email sent:", welcome.data?.id);

  const alert = await resend.emails.send(
    {
      from,
      to: [admin],
      subject: `[test] Newsletter signup — ${normalized}`,
      html: `<p>Direct script test — <strong>${normalized}</strong> signed up.</p>`,
      text: `Direct script test — ${normalized} signed up.`,
    },
    { idempotencyKey: `test-newsletter-admin/${normalized}` },
  );

  if (alert.error) {
    console.error("✗ Admin alert failed:", alert.error.message);
    process.exit(1);
  }
  console.log("✓ Admin alert sent:", alert.data?.id);

  await sql`
    UPDATE newsletter_subscribers
    SET welcome_sent_at = now()
    WHERE email = ${normalized}
  `;

  console.log("✓ Subscriber recorded in newsletter_subscribers");
}

if (direct) {
  await viaDirect();
} else {
  await viaApi();
}