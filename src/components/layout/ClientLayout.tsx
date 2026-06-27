'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { TopNav } from '@/components/layout/TopNav';
import { BottomTab } from '@/components/layout/BottomTab';
import { LegalFooter } from '@/components/layout/LegalFooter';
import { ToastProvider } from '@/components/common/Toast';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        <ToastProvider />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <TopNav />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md md:max-w-5xl md:pt-6">
          {children}
        </div>
        <div className="h-12 md:h-8" />
      </main>
      <div className="md:hidden">
        <BottomTab />
      </div>
      <LegalFooter />
      <ToastProvider />
    </div>
  );
}
