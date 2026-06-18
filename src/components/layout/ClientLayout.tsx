'use client';

import { Header } from '@/components/layout/Header';
import { TopNav } from '@/components/layout/TopNav';
import { BottomTab } from '@/components/layout/BottomTab';
import { LegalFooter } from '@/components/layout/LegalFooter';
import { ToastProvider } from '@/components/common/Toast';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <TopNav />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md md:max-w-5xl md:pt-6">
          {children}
        </div>
      </main>
      <div className="md:hidden">
        <BottomTab />
      </div>
      <LegalFooter />
      <ToastProvider />
    </div>
  );
}
