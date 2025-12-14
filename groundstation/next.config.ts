import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Force Next.js to generate static HTML/CSS/JS files.
  // Tauri doesn't run a Node.js server, so it can't handle server-side rendering (SSR).
  output: 'export',

  // 2. Disable default image optimization.
  // Next/Image requires a server to optimize images on the fly, which isn't available here.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;