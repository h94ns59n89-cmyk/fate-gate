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
  { href: '/admin', label: '管理后台' },
];

function useAdmin() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('admin_auth');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function TopNav() {
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);
  const admin = useAdmin();

  return (
    <header className="hidden w-full border-b border-[rgba(0,0,0,0.04)] bg-[rgba(255,255,255,0.82)] backdrop-blur-lg md:block">
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
                  ? 'bg-[#9B7FBB]/15 text-[#9B7FBB]'
                  : 'text-[#6B6778] hover:bg-[#F5F0FA] hover:text-[#1F1D2B]',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {admin ? (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A88D]/20 text-xs font-medium text-[#C9A88D]">
                管
              </div>
              <span className="text-xs text-[#6B6778]">管理员</span>
            </div>
          ) : user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.nickname ?? '用户'}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9B7FBB]/20 text-xs text-[#9B7FBB]">
              {(user?.nickname ?? '?').charAt(0)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
