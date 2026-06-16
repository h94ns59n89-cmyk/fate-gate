import Link from 'next/link';

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full max-w-md border-b border-[#3c3c3c] bg-[#252526]">
      <div className="flex items-center justify-between px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide text-[#d4a853]">命理人格</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/mine" className="text-xs text-[#858585] transition-colors hover:text-[#d4d4d4]">
            我的
          </Link>
        </nav>
      </div>
    </header>
  );
}
