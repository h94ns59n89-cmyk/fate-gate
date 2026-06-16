import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-brand p-8 text-center">
      <div className="text-6xl">🔮</div>
      <h1 className="text-2xl font-bold text-white">页面不存在</h1>
      <p className="text-sm text-white/60">这个页面似乎走丢了</p>
      <Link
        href="/"
        className="rounded-xl bg-brand-gold px-6 py-3 font-medium text-brand-navy transition-colors hover:bg-brand-gold-light"
      >
        返回首页
      </Link>
    </div>
  );
}
