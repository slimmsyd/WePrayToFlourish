import "server-only";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Add your Neon connection string to .env.local.",
  );
}

// Neon HTTP driver — ideal for serverless route handlers (one round-trip,
// no connection pool to manage). Use as a tagged template: sql`SELECT ...`.
export const sql = neon(url);
