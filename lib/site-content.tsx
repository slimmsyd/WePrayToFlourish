"use client";

import { createContext, useContext } from "react";
import type { SiteContent } from "./content";

// Live site content for CLIENT components. The server reads getSiteContent()
// once in the root layout and feeds it here; client components read it via
// useSiteContent() instead of importing the static site.config directly.
const Ctx = createContext<SiteContent | null>(null);

export function SiteContentProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={content}>{children}</Ctx.Provider>;
}

export function useSiteContent(): SiteContent {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSiteContent must be used within SiteContentProvider");
  return c;
}
