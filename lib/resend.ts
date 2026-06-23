import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

export function getResend(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not set. Add it to .env.local (https://resend.com/api-keys).",
      );
    }
    client = new Resend(apiKey);
  }
  return client;
}

/** True when Resend is configured enough to attempt sends. */
export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY &&
      process.env.RESEND_FROM_EMAIL &&
      process.env.ADMIN_NOTIFICATION_EMAIL,
  );
}

export function getFromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!from) {
    throw new Error(
      'RESEND_FROM_EMAIL is not set. Example: "We Pray To Flourish <hello@wepray2flourish.net>"',
    );
  }
  return from;
}

export function getAdminEmail(): string {
  const email = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (!email) {
    throw new Error(
      "ADMIN_NOTIFICATION_EMAIL is not set. This address receives purchase and signup alerts.",
    );
  }
  return email;
}