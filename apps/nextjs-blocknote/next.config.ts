import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@filezen/js', '@filezen/next', '@filezen/react'],
  experimental: {
    optimizePackageImports: ['@blocknote/core', '@blocknote/react', '@blocknote/mantine'],
  },
};

export default nextConfig; 