'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', label: '首页', icon: '🏠' },
  { href: '/mine', label: '我的报告', icon: '📊' },
  { href: '/comparison', label: '合盘', icon: '💞' },
];

export function BottomTab() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-50 w-full max-w-md border-t border-[#3c3c3c] bg-[#252526]">
      <div className="flex justify-around py-1.5">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-4 py-2 text-xs transition-colors',
              pathname === tab.href
                ? 'text-[#d4a853]'
                : 'text-[#858585] hover:text-[#d4d4d4]',
            )}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
