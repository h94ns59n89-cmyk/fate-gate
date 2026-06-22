import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 24, text: 'text-base' },
  md: { icon: 32, text: 'text-lg' },
  lg: { icon: 44, text: 'text-2xl' },
};

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const s = sizes[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="星隅"
        role="img"
      >
        <defs>
          <linearGradient id="blob-a" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#FF9A9E" />
            <stop offset="50%" stopColor="#FAD0C4" />
            <stop offset="100%" stopColor="#FBC2EB" />
          </linearGradient>
          <linearGradient id="blob-b" x1="48" y1="0" x2="0" y2="48">
            <stop offset="0%" stopColor="#A18CD1" />
            <stop offset="50%" stopColor="#FBC2EB" />
            <stop offset="100%" stopColor="#A18CD1" />
          </linearGradient>
          <linearGradient id="blob-c" x1="24" y1="0" x2="24" y2="48">
            <stop offset="0%" stopColor="#FFD1FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E0BBE4" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Back blob */}
        <path
          d="M36 10C40 10 44 14 44 20C44 26 42 32 38 36C34 40 28 42 22 42C16 42 10 40 6 36C2 32 4 24 6 18C8 12 12 8 18 6C24 4 32 10 36 10Z"
          fill="url(#blob-b)"
          opacity="0.35"
        />
        {/* Front blob */}
        <path
          d="M32 12C37 12 40 15 42 20C44 25 42 32 38 36C34 40 28 40 22 40C16 40 10 38 8 34C6 30 6 24 8 18C10 12 14 8 20 8C26 8 27 12 32 12Z"
          fill="url(#blob-a)"
          opacity="0.55"
        />
        {/* Highlight */}
        <path
          d="M26 14C30 14 34 17 36 22C38 27 36 32 32 35C28 38 22 38 18 35C14 32 12 27 14 22C16 17 22 14 26 14Z"
          fill="url(#blob-c)"
          opacity="0.5"
        />
        {/* Small accent dots */}
        <circle cx="20" cy="18" r="2" fill="#FFFFFF" opacity="0.6" />
        <circle cx="30" cy="28" r="1.5" fill="#FFFFFF" opacity="0.4" />
        <circle cx="14" cy="28" r="1" fill="#FBC2EB" opacity="0.5" />
      </svg>
      {showText && (
        <span className="font-serif font-semibold tracking-wider text-[#A18CD1] drop-shadow-sm" style={{ fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.125rem' : '1.5rem' }}>
          星隅
        </span>
      )}
    </Link>
  );
}
