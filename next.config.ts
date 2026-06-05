import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "myanimelist.net" },
      { protocol: "https", hostname: "egyhero.social" },
      { protocol: "http", hostname: "209.38.199.135" }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://209.38.199.135/api/:path*',
      },
    ];
  },
};

export default NextConfig;
