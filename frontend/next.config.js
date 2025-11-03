// /frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // CONFIGURACIÓN CLAVE PARA IMÁGENES EXTERNAS
  images: {
    domains: ['cdn.weatherapi.com'], 
  },
}

module.exports = nextConfig