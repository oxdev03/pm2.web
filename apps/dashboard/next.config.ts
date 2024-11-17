/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { NextConfig } from "next";
import "./env.js";

const nextConfig : NextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ["components", "middleware", "app", "server", "types", "utils"],
  },
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
};

export default nextConfig;
