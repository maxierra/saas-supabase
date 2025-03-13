/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Configuración simplificada para compatibilidad con Render
  webpack: (config, { dev, isServer }) => {
    // Add any custom webpack configurations here
    return config
  },
  // Ignorar errores de ESLint durante la construcción
  eslint: {
    // No fallar la construcción si hay errores de ESLint
    ignoreDuringBuilds: true,
  },
  // Ignorar errores de TypeScript durante la construcción
  typescript: {
    // No fallar la construcción si hay errores de TypeScript
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;