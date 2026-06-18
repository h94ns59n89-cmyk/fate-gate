'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { Logo } from '@/components/common/Logo';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/mine', label: '我的报告' },
  { href: '/comparison', label: '合盘' },
];

export function TopNav() {
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);

  return (
    <header className="hidden w-full border-b border-[#2a3040] bg-[#111827] md:block">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-[3px] px-3 py-1.5 text-xs transition-colors',
                pathname === link.href
                  ? 'bg-[#d4a853]/15 text-[#d4a853]'
                  : 'text-[#858585] hover:bg-[#1e2433] hover:text-[#d4d4d4]',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.nickname ?? '用户'}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4a853]/20 text-xs text-[#d4a853]">
              {(user?.nickname ?? '?').charAt(0)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
