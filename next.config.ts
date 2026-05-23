import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "myanimelist.net",
      },
      {
        protocol: "https",
        hostname: "egyhero.social",
      },
      {
        protocol: "https",
        hostname: "egyhero.social",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://egyhero.social/api/:path*',
      },
    ];
  },
};

export default NextConfig;
