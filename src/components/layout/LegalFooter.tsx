import Link from 'next/link';

export function LegalFooter() {
  return (
    <div className="hidden flex-col items-center gap-1 border-t border-[rgba(0,0,0,0.04)] bg-[#F8F8FA] px-4 py-3 md:flex">
      <div className="flex items-center gap-2">
        <Link href="/terms" className="text-[10px] text-[#8A8696] hover:text-[#6B6778]">用户协议</Link>
        <span className="text-[10px] text-[#C4C1CE]">|</span>
        <Link href="/privacy" className="text-[10px] text-[#8A8696] hover:text-[#6B6778]">隐私政策</Link>
        <span className="text-[10px] text-[#C4C1CE]">|</span>
        <Link href="/disclaimer" className="text-[10px] text-[#8A8696] hover:text-[#6B6778]">免责声明</Link>
      </div>
      <span className="text-[10px] text-[#C4C1CE]">© 2026 星隅</span>
    </div>
  );
}
