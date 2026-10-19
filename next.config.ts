import type { NextConfig } from "next";

/**
 * Static export: the whole app runs in the browser and stores data on the
 * user's device (see docs/DECISIONS.md D-010). It can be hosted for free on
 * any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages).
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
