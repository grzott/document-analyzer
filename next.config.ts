import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Configure PDF.js
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Disable canvas for PDF.js
        canvas: false,
      };
    }

    // Handle .mjs files (used by PDF.js)
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
  // Ignore PDF.js worker warnings
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
