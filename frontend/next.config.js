// /frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // CONFIGURACIÓN ACTUALIZADA: Usando remotePatterns
  images: {
    // Permite la carga segura de imágenes de WeatherAPI
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.weatherapi.com',
        // Opcional: Especifica los puertos si no son 80/443
        // port: '',
        // Opcional: Especifica el patrón de ruta si es necesario (ej: '/icons/**')
        // pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig