import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/upload',
  //       destination: `${process.env.NEXT_PUBLIC_FLASK_APIKEY}/upload`,
  //     }
  //   ];
  // }
};

export default nextConfig;
