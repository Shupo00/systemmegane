import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  webpack: (config) => {
    // Support @ alias (root) for both TS and JS runtime in Vercel
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      ['@']: path.resolve(process.cwd()),
    };
    return config;
  },
};

export default nextConfig;
