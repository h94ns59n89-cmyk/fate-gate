import type { Metadata, Viewport } from 'next';
import { ClientLayout } from '@/components/layout/ClientLayout';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: '简人格测试 - 30秒测出你的简人格',
  description: '输入出生信息，AI 基于八字命理分析你的简人格。免费获取3个人格标签+五行能量图。',
  openGraph: {
    title: '测一测你的简人格 | 30秒出结果',
    description: '和 MBTI 一样有趣的简人格测试',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#1A1A2E',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <script src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js" async />
      </head>
      <body className="min-h-screen bg-gradient-brand">
        <main className="mx-auto max-w-md">
          <ClientLayout>{children}</ClientLayout>
        </main>
      </body>
    </html>
  );
}
