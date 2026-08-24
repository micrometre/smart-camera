/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const isVercel = !!process.env.VERCEL;
    const rules = [
      {
        source: '/',
        destination: '/landing.html',
      },
    ];
    
    if (isVercel) {
      rules.push({
        source: '/images/:path*',
        destination: '/api/images/:path*',
      });
    }
    
    return {
      beforeFiles: rules,
    };
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
