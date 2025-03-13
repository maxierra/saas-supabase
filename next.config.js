/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Configuración simplificada para compatibilidad con Render
  webpack: (config, { dev, isServer }) => {
    // Add any custom webpack configurations here
    return config
  },
};

module.exports = nextConfig;