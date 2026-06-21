import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Non-throwing at import so `next build` works even before DATABASE_URL is set
// (e.g. on Vercel). When unset, `dbEnabled` is false and reads fall back to the
// static site.config; the `sql` stub only throws if actually called.
const url = process.env.DATABASE_URL;

export const dbEnabled = Boolean(url);

export const sql: NeonQueryFunction<false, false> = url
  ? neon(url)
  : (((() => {
      throw new Error("Database is disabled (DATABASE_URL is not set).");
    }) as unknown) as NeonQueryFunction<false, false>);
