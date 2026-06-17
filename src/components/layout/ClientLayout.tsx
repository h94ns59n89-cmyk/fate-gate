'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { TopNav } from '@/components/layout/TopNav';
import { BottomTab } from '@/components/layout/BottomTab';
import { LegalFooter } from '@/components/layout/LegalFooter';
import { ToastProvider } from '@/components/common/Toast';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideTab = pathname === '/';

  return (
    <>
      <Header />
      <TopNav />
      <div className="mx-auto max-w-md md:max-w-5xl md:pt-6">
        {children}
      </div>
      <div className="md:hidden">
        {!hideTab && <BottomTab />}
      </div>
      <LegalFooter />
      <ToastProvider />
    </>
  );
}
