import type { NextConfig } from "next";

// Public files keep the same name when their content changes, so they are not immutable.
const publicAssetCache = "public, max-age=86400, stale-while-revalidate=604800";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async headers() {
    return ["/DirmanQuiz-Logo-Kit/:path*", "/backgrounds/:path*"].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: publicAssetCache }],
    }));
  },
};

export default nextConfig;
