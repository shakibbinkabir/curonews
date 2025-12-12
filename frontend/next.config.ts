import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Enable static export for cPanel deployment
  // Uncomment the line below when building for static hosting
  // output: 'export',
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        // Production: update with your domain
        protocol: 'https',
        hostname: '*.yourdomain.com',
        pathname: '/storage/**',
      },
    ],
    dangerouslyAllowSVG: true,
    // Set to true for static export or when using external image service
    unoptimized: process.env.NODE_ENV === 'development' || process.env.STATIC_EXPORT === 'true',
  },
  allowedDevOrigins: ['http://127.0.0.1:3000', 'http://localhost:3000', '127.0.0.1', 'localhost'],
};

export default nextConfig;
