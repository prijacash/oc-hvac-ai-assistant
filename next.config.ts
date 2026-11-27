import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Markdown is read from disk at request time. Include it in the server trace.
  outputFileTracingIncludes: {
    "/api/chat": ["./knowledge/**/*.md"],
  },
};

export default nextConfig;
