import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 내용이 겹쳐 통합한 가이드의 이전 주소 → 통합된 글로 영구 이동
  async redirects() {
    return [
      { source: "/guide/ably-zigzag-thumbnail-guide", destination: "/guide/fashion", permanent: true },
      { source: "/guide/coupang-rocket-growth-image-rules", destination: "/guide/coupang", permanent: true },
      { source: "/guide/smartstore-search-seo-image-tips", destination: "/guide/smartstore", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
