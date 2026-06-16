import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[#2d2d2d]',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-3 rounded-[2px]',
        variant === 'rectangular' && 'rounded-[4px]',
        className,
      )}
      style={{ width, height }}
      role="status"
      aria-label="加载中"
    />
  );
}
