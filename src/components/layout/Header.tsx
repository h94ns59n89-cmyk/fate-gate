import Link from 'next/link';
import { Logo } from '@/components/common/Logo';

export function Header() {
  return (
    <header className="w-full max-w-md border-b border-[rgba(0,0,0,0.04)] bg-[rgba(255,255,255,0.82)] backdrop-blur-lg">
      <div className="flex items-center justify-between px-4 py-2.5">
        <Logo size="sm" />
        <nav className="flex items-center gap-3">
          <Link href="/mine" className="text-xs text-[#6B6778] transition-colors hover:text-[#1F1D2B]">
            我的
          </Link>
        </nav>
      </div>
    </header>
  );
}
