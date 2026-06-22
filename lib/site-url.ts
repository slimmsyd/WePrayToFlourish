/** Canonical public origin for metadata, Stripe return URLs, and OG tags. */
export function resolveSiteUrl(domain: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const isLocalhost =
    !configured ||
    configured.includes("localhost") ||
    configured.includes("127.0.0.1");

  if (configured && !isLocalhost) return configured;
  if (process.env.NODE_ENV === "production") return `https://${domain}`;
  return configured ?? `http://localhost:3000`;
}