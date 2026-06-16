import type { Metadata, Viewport } from 'next';
import { Noto_Serif_SC } from 'next/font/google';
import { ClientLayout } from '@/components/layout/ClientLayout';
import '@/styles/globals.css';

const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: '星隅 - 30 秒照见独一无二的你',
  description: '输入出生信息，AI 基于八字命理分析你的人格。免费获取3个人格标签+五行能量图。',
  openGraph: {
    title: '测一测你的人格 | 30秒出结果',
    description: '和 MBTI 一样有趣的人格测试',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B0E14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${notoSerif.variable}`}>
      <head>
        <script src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js" async />
      </head>
      <body className="min-h-screen bg-gradient-brand">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
