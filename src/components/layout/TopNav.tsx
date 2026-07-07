'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Logo } from '@/components/common/Logo';
import { SettingsModal } from '@/components/common/SettingsModal';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/mine', label: '我的报告' },
  { href: '/comparison', label: '合盘' },
  { href: '/admin', label: '报告管理' },
  { href: '/admin/users', label: '用户管理' },
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userId = useUserStore((s) => s.userId);
  const isGuest = useUserStore((s) => s.isGuest);
  const isAdminPage = pathname.startsWith('/admin');

  const handleLogout = useUserStore((s) => s.logout);

  const visibleLinks = admin
    ? navLinks.filter((link) => link.href.startsWith('/admin'))
    : navLinks.filter((link) => !link.href.startsWith('/admin'));

  const handleAdminLogout = () => {
    try { localStorage.removeItem('admin_auth'); } catch {}
    setDropdownOpen(false);
    window.location.reload();
  };

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (<>
    <header className="hidden w-full border-b border-[rgba(0,0,0,0.04)] bg-[rgba(255,255,255,0.82)] backdrop-blur-lg md:block">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-1">
          {visibleLinks.map((link) => (
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
          {!admin && (
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#8A8696] transition-colors hover:bg-[#F5F0FA] hover:text-[#1F1D2B]"
              title="模型配置"
            >
              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.68 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          )}
          {admin ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-[6px] px-2 py-1 transition-colors hover:bg-[#F5F0FA]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A88D]/20 text-xs font-medium text-[#C9A88D]">
                  管
                </div>
                <span className="text-xs text-[#6B6778]">{admin?.name ?? '管理员'}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 overflow-hidden rounded-[8px] border border-[rgba(0,0,0,0.08)] bg-[#FFFFFF] py-1 shadow-lg">
                  <button
                    onClick={handleAdminLogout}
                    className="w-full px-3 py-1.5 text-left text-xs text-[#6B6778] transition-colors hover:bg-[#F5F4F7]"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : isAdminPage ? null : user && !isGuest ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-[6px] px-2 py-1 transition-colors hover:bg-[#F5F0FA]"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.nickname ?? '用户'} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9B7FBB]/20 text-xs text-[#9B7FBB]">
                    {(user.nickname ?? '?').charAt(0)}
                  </div>
                )}
                <span className="text-xs text-[#6B6778]">{user.nickname}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 overflow-hidden rounded-[8px] border border-[rgba(0,0,0,0.08)] bg-[#FFFFFF] py-1 shadow-lg">
                  <button
                    onClick={() => { handleLogout(); setDropdownOpen(false); window.location.href = '/'; }}
                    className="w-full px-3 py-1.5 text-left text-xs text-[#6B6778] transition-colors hover:bg-[#F5F4F7]"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9B7FBB]/20 text-xs text-[#9B7FBB]">
                {(user?.nickname ?? '?').charAt(0)}
              </div>
              {userId ? (
                <>
                  <span className="text-xs text-[#8A8696]">游客_{userId}</span>
                  <Link
                    href="/login"
                    className="ml-1 rounded-[6px] border border-[#9B7FBB]/30 px-2.5 py-1 text-xs text-[#9B7FBB] transition-colors hover:bg-[#9B7FBB]/10"
                  >
                    登录
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-[6px] border border-[#9B7FBB]/30 px-2.5 py-1 text-xs text-[#9B7FBB] transition-colors hover:bg-[#9B7FBB]/10"
                >
                  登录
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
