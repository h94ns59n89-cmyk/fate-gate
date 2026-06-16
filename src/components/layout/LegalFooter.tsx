import Link from 'next/link';

export function LegalFooter() {
  return (
    <div className="fixed bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 md:flex">
      <div className="flex items-center gap-2">
        <Link href="/terms" className="text-[10px] text-[#6a6a6a] hover:text-[#858585]">用户协议</Link>
        <span className="text-[10px] text-[#2a3040]">|</span>
        <Link href="/privacy" className="text-[10px] text-[#6a6a6a] hover:text-[#858585]">隐私政策</Link>
        <span className="text-[10px] text-[#2a3040]">|</span>
        <Link href="/disclaimer" className="text-[10px] text-[#6a6a6a] hover:text-[#858585]">免责声明</Link>
      </div>
      <span className="text-[10px] text-[#374151]">© 2026 星隅</span>
    </div>
  );
}
