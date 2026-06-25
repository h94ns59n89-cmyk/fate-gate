import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 24, text: 'text-sm' },
  md: { icon: 32, text: 'text-base' },
  lg: { icon: 48, text: 'text-xl' },
};

const logoPath = {
  star: 'M32 12 C38 12 42 16 44 22 C46 28 50 30 50 32 C50 34 46 36 44 42 C42 48 38 52 32 52 C26 52 22 48 20 42 C18 36 14 34 14 32 C14 30 18 28 20 22 C22 16 26 12 32 12Z',
  arc: 'M46 14 C54 14 56 22 56 32 C56 42 54 50 46 50',
  glow: 'M32 18 C36 18 39 21 40 25 C41 29 44 31 44 32 C44 33 41 35 40 39 C39 43 36 46 32 46 C28 46 25 43 24 39 C23 35 20 33 20 32 C20 31 23 29 24 25 C25 21 28 18 32 18Z',
  thread1: 'M26 28 C30 24 34 30 38 26',
  thread2: 'M26 32 C30 36 34 31 38 36',
};

function LogoSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="星隅" role="img">
      <path d={logoPath.arc} stroke="#C9A9E6" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.3" />
      <path d={logoPath.star} fill="#C9A9E6" opacity="0.92" />
      <path d={logoPath.glow} fill="#FFF8FC" opacity="0.15" />
      <path d={logoPath.thread1} stroke="#FFF8FC" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.45" />
      <path d={logoPath.thread2} stroke="#FFF8FC" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.35" />
      {size >= 32 && <circle cx="28" cy="22" r="1.5" fill="#FFF8FC" opacity="0.4" />}
      {size >= 32 && <circle cx="38" cy="40" r="1" fill="#FFF8FC" opacity="0.3" />}
    </svg>
  );
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const s = sizes[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <LogoSvg size={s.icon} />
      {showText && (
        <span className="font-light tracking-wider text-[#BFA8E8]" style={{ fontSize: size === 'sm' ? '0.9rem' : size === 'md' ? '1rem' : '1.25rem' }}>
          星隅
        </span>
      )}
    </Link>
  );
}
