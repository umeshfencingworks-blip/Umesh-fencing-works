/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Prevent ChunkLoadError timeouts on Windows/OneDrive environments
      config.output.chunkLoadTimeout = 300000;
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/ledger',
        destination: '/admin-controls?tab=financial-ledger',
        permanent: false,
      },
      {
        source: '/payments',
        destination: '/admin-controls?tab=payments',
        permanent: false,
      },
      {
        source: '/business-snapshot',
        destination: '/admin-controls?tab=snapshot',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
