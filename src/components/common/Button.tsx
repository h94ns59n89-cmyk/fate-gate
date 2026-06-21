'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary:
    'bg-[#9B7FBB] text-white font-semibold hover:bg-[#BBA3D5] active:bg-[#7D5FA0]',
  secondary:
    'bg-[#F8F8FA] text-[#1F1D2B] border border-[rgba(0,0,0,0.08)] hover:bg-[#F0ECF5] active:bg-[#E8E0F5]',
  ghost:
    'text-[#6B6778] hover:text-[#1F1D2B] hover:bg-[#F5F0FA]',
  outline:
    'border border-[#9B7FBB]/50 text-[#9B7FBB] hover:bg-[#9B7FBB]/10',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-button font-medium transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-[#9B7FBB]/30 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
