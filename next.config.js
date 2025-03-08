/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Enable build cache
    incrementalCacheHandlerPath: require.resolve('./cache-handler.js'),
  },
  // Specify Node.js version compatibility
  engines: {
    node: '>=18.17.0'
  },
  // Configure webpack for better optimization
  webpack: (config, { dev, isServer }) => {
    // Add any custom webpack configurations here
    return config
  },
};

module.exports = nextConfig;