import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thirdwx.qlogo.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-fate-gate.r2.dev',
        pathname: '/**',
      },
    ],
  },

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://res.wx.qq.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https://thirdwx.qlogo.cn https://pub-fate-gate.r2.dev",
            "connect-src 'self' https://api.weixin.qq.com https://api.deepseek.com https://api.openai.com",
            "frame-src 'self' https://res.wx.qq.com",
          ].join('; '),
        },
      ],
    },
  ],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
