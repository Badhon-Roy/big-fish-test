/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 95, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
