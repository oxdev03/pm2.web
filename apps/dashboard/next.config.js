/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ["components", "middleware", "page", "server", "types", "utils"],
  },
};

module.exports = nextConfig;
