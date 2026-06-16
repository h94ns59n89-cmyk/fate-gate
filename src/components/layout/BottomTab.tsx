'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', label: '首页' },
  { href: '/mine', label: '我的报告' },
  { href: '/comparison', label: '合盘' },
];

export function BottomTab() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-50 w-full max-w-md border-t border-[#2a3040] bg-[#111827] md:hidden">
      <div className="flex justify-around py-1">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0 py-1.5 text-xs transition-colors',
              pathname === tab.href
                ? 'text-[#d4a853]'
                : 'text-[#858585] hover:text-[#d4d4d4]',
            )}
          >
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-[#2a3040]/30 px-4 py-0.5">
        <Link href="/terms" className="text-[9px] text-[#6a6a6a] hover:text-[#858585]">用户协议</Link>
        <span className="text-[9px] text-[#2a3040]">|</span>
        <Link href="/privacy" className="text-[9px] text-[#6a6a6a] hover:text-[#858585]">隐私政策</Link>
        <span className="text-[9px] text-[#2a3040]">|</span>
        <Link href="/disclaimer" className="text-[9px] text-[#6a6a6a] hover:text-[#858585]">免责声明</Link>
      </div>
    </nav>
  );
}
