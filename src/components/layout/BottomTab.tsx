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

const legalLinks = [
  { href: '/terms', label: '用户协议' },
  { href: '/privacy', label: '隐私政策' },
  { href: '/disclaimer', label: '免责声明' },
];

export function BottomTab() {
  const pathname = usePathname();

  return (
    <nav className="w-full max-w-md bg-[rgba(255,255,255,0.82)] backdrop-blur-lg md:hidden">
      {/* Navigation tabs */}
      <div className="flex justify-around border-t border-[rgba(0,0,0,0.04)]">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                active ? 'text-[#9B7FBB]' : 'text-[#8A8696] hover:text-[#1F1D2B]',
              )}
            >
              {active && <div className="absolute top-0 h-0.5 w-8 rounded-b-[2px] bg-[#9B7FBB]" />}
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      {/* Legal links bar */}
      <div className="flex items-center justify-center gap-3 border-t border-[rgba(0,0,0,0.03)] py-1">
        {legalLinks.map((link, i) => (
          <span key={link.href} className="flex items-center gap-3">
            {i > 0 && <span className="text-[10px] text-[#C4C1CE]">|</span>}
            <Link
              href={link.href}
              className="text-[10px] leading-none text-[#8A8696] transition-colors hover:text-[#6B6778]"
            >
              {link.label}
            </Link>
          </span>
        ))}
      </div>
    </nav>
  );
}
