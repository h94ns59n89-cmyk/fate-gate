'use client';

import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

function useAdmin() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('admin_auth');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const adminLinks = [
  { href: '/admin', label: '报告' },
  { href: '/admin/users', label: '用户' },
];

export function Header() {
  const pathname = usePathname();
  const admin = useAdmin();

  return (
    <header className="w-full max-w-md border-b border-[rgba(0,0,0,0.04)] bg-[rgba(255,255,255,0.82)] backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <Logo size="sm" />
        <nav className="flex items-center gap-3">
          <Link href="/mine" className={cn('text-xs transition-colors', pathname === '/mine' ? 'text-[#9B7FBB] font-medium' : 'text-[#6B6778] hover:text-[#1F1D2B]')}>
            我的
          </Link>
          {admin && adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-xs transition-colors',
                link.href === '/admin'
                  ? pathname.startsWith('/admin') && !pathname.includes('/users')
                    ? 'text-[#C9A88D] font-medium'
                    : 'text-[#6B6778] hover:text-[#1F1D2B]'
                  : pathname.includes('/users')
                    ? 'text-[#C9A88D] font-medium'
                    : 'text-[#6B6778] hover:text-[#1F1D2B]',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
