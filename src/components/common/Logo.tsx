import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 20, text: 'text-base' },
  md: { icon: 24, text: 'text-lg' },
  lg: { icon: 32, text: 'text-2xl' },
};

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const s = sizes[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="星隅"
        role="img"
      >
        <defs>
          <linearGradient id="star-grad" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="#F0D78C" />
            <stop offset="100%" stopColor="#B8923E" />
          </linearGradient>
        </defs>

        <circle cx="16" cy="16" r="3" fill="#D4A853" />

        <circle cx="16" cy="4" r="1.2" fill="#D4A853" opacity="0.4" />
        <circle cx="28" cy="12" r="1" fill="#D4A853" opacity="0.3" />
        <circle cx="24" cy="26" r="1" fill="#D4A853" opacity="0.35" />
        <circle cx="8" cy="24" r="0.8" fill="#D4A853" opacity="0.25" />
        <circle cx="5" cy="9" r="0.8" fill="#D4A853" opacity="0.3" />

        <line x1="16" y1="4" x2="16" y2="7" stroke="#D4A853" strokeWidth="0.5" opacity="0.3" />
        <line x1="28" y1="12" x2="19" y2="14" stroke="#D4A853" strokeWidth="0.5" opacity="0.25" />
        <line x1="24" y1="26" x2="19" y2="19" stroke="#D4A853" strokeWidth="0.5" opacity="0.25" />
        <line x1="8" y1="24" x2="13" y2="19" stroke="#D4A853" strokeWidth="0.5" opacity="0.25" />
        <line x1="5" y1="9" x2="13" y2="14" stroke="#D4A853" strokeWidth="0.5" opacity="0.25" />

        <path
          d="M16 6 L18 12 L24 14 L18 16 L16 22 L14 16 L8 14 L14 12 Z"
          fill="url(#star-grad)"
          opacity="0.9"
        />
      </svg>
      {showText && (
        <span className={`font-serif font-semibold tracking-wider text-[#d4a853] ${s.text}`}>
          星隅
        </span>
      )}
    </Link>
  );
}
