import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The admin content editor can embed uploaded images as data URLs, so the
    // Server Action payload (the whole content draft) can exceed the 1MB default.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
