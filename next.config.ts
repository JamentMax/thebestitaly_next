/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['127.0.0.1', 'localhost', 'ebf8-82-85-69-173.ngrok-free.app'], // Aggiungi il dominio ngrok
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8055',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'ebf8-82-85-69-173.ngrok-free.app',
        pathname: '/assets/**',
      },
    ],
  },
};

module.exports = nextConfig;