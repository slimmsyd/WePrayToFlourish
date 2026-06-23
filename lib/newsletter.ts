import "server-only";
import { sql } from "./db";
import { sendNewsletterEmails } from "./email";

export type NewsletterSubscriber = {
  id: number;
  email: string;
  welcome_sent_at: string | null;
  created_at: string;
};

export const NEWSLETTER_DDL = `
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email             TEXT NOT NULL UNIQUE,
    welcome_sent_at   TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

export async function ensureNewsletterTable(): Promise<void> {
  await sql.query(NEWSLETTER_DDL);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) return null;
  return email;
}

/**
 * Record a newsletter signup and send welcome + admin emails on first signup.
 * Duplicate emails return success without re-sending (privacy-friendly).
 */
export async function subscribeNewsletter(rawEmail: string): Promise<{
  ok: boolean;
  alreadySubscribed: boolean;
  error?: string;
}> {
  const email = normalizeEmail(rawEmail);
  if (!email) {
    return { ok: false, alreadySubscribed: false, error: "Invalid email address" };
  }

  await ensureNewsletterTable();

  const inserted = await sql`
    INSERT INTO newsletter_subscribers (email)
    VALUES (${email})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, welcome_sent_at, created_at
  `;

  if (!inserted[0]) {
    return { ok: true, alreadySubscribed: true };
  }

  const sendResult = await sendNewsletterEmails(email);
  if (sendResult.ok) {
    await sql`
      UPDATE newsletter_subscribers
      SET welcome_sent_at = now()
      WHERE email = ${email}
    `;
    return { ok: true, alreadySubscribed: false };
  }

  // Signup is recorded even if email fails — admin can follow up manually.
  console.error("[newsletter] emails failed for", email, sendResult.error);
  return { ok: true, alreadySubscribed: false };
}