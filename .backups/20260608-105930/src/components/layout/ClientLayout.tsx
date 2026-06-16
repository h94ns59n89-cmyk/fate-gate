'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomTab } from '@/components/layout/BottomTab';
import { ToastProvider } from '@/components/common/Toast';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideTab = pathname === '/';

  return (
    <>
      <Header />
      {children}
      {!hideTab && <BottomTab />}
      <ToastProvider />
    </>
  );
}
