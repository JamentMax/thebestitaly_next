/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['127.0.0.1', 'localhost'], // Consenti solo domini locali
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8055',
        pathname: '/assets/**', // Percorso per le immagini di Directus
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8055/:path*', // Reindirizzamento API a Directus locale
      },
    ];
  },
};

module.exports = nextConfig;