import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@langstudio/db", "@langstudio/shared", "@langstudio/ui"],
};

export default nextConfig;