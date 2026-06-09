import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Prevent webpack from bundling these server-only packages (Next.js 14 key).
    serverComponentsExternalPackages: [
      "bcryptjs",
      "@prisma/client",
      "@prisma/adapter-pg",
      "pg",
      "pg-native",
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },

  webpack(config, { isServer }) {
    if (!isServer) {
      // Prevent any Node.js-only module from leaking into the browser bundle.
      // Setting a key to `false` tells webpack to provide an empty module.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // node: prefixed (webpack 5 / Node 18+)
        "node:crypto": false,
        "node:stream": false,
        "node:buffer": false,
        "node:util": false,
        "node:events": false,
        "node:path": false,
        "node:os": false,
        "node:fs": false,
        "node:net": false,
        "node:tls": false,
        "node:http": false,
        "node:https": false,
        "node:zlib": false,
        "node:async_hooks": false,
        // bare names (older require() paths)
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        events: false,
        path: false,
        os: false,
        fs: false,
        net: false,
        tls: false,
        http: false,
        https: false,
        zlib: false,
      };
    }

    return config;
  },
};

export default withNextIntl(nextConfig);
