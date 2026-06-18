import Link from 'next/link';
import { Logo } from '@/components/common/Logo';

export function Header() {
  return (
    <header className="w-full max-w-md border-b border-[#2a3040] bg-[#111827]">
      <div className="flex items-center justify-between px-4 py-2.5">
        <Logo size="sm" />
        <nav className="flex items-center gap-3">
          <Link href="/mine" className="text-xs text-[#858585] transition-colors hover:text-[#d4d4d4]">
            我的
          </Link>
        </nav>
      </div>
    </header>
  );
}
