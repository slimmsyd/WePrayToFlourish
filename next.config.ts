import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin workspace root so Turbopack doesn't pick a parent folder when another
  // lockfile exists nearby (e.g. Code_Projects/package-lock.json).
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    // The admin content editor can embed uploaded images as data URLs, so the
    // Server Action payload (the whole content draft) can exceed the 1MB default.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
