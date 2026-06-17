'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', label: '首页', icon: Home },
  { href: '/mine', label: '我的报告', icon: BarChart3 },
  { href: '/comparison', label: '合盘', icon: GitCompare },
];

export function BottomTab() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-50 w-full max-w-md border-t border-[#2a3040] bg-[#111827] md:hidden">
      <div className="flex justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                active ? 'text-[#d4a853]' : 'text-[#858585] hover:text-[#d4d4d4]',
              )}
            >
              {active && <div className="absolute top-0 h-0.5 w-8 rounded-b-[2px] bg-[#d4a853]" />}
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
