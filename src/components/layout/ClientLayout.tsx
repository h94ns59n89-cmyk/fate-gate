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
        {!hideTab ? (
          <BottomTab />
        ) : (
          <div className="fixed bottom-0 z-50 w-full max-w-md border-t border-[#2a3040] bg-[#111827]">
            <div className="flex items-center justify-center gap-4 px-4 py-3">
              <a href="/terms" className="text-[9px] text-[#6a6a6a] hover:text-[#858585]">用户协议</a>
              <span className="text-[9px] text-[#2a3040]">|</span>
              <a href="/privacy" className="text-[9px] text-[#6a6a6a] hover:text-[#858585]">隐私政策</a>
              <span className="text-[9px] text-[#2a3040]">|</span>
              <a href="/disclaimer" className="text-[9px] text-[#6a6a6a] hover:text-[#858585]">免责声明</a>
            </div>
          </div>
        )}
      </div>
      <LegalFooter />
      <ToastProvider />
    </>
  );
}
