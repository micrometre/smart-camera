/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          destination: '/landing.html',
        },
      ],
    };
  },
};

export default nextConfig;
