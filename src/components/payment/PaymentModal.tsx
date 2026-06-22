'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  amount?: number;
  productName?: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount = 990,
  productName = '完整人格报告',
}: PaymentModalProps) {
  const [paying, setPaying] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setPaying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onSuccess?.();
      onClose();
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="支付确认"
        className={cn(
          'relative z-10 w-full max-w-md rounded-t-[6px] border-t border-[rgba(0,0,0,0.08)] bg-[#FFFFFF] p-5 shadow-modal sm:rounded-[6px]',
        )}
      >
        <div className="mb-5 text-center">
          <div className="mb-2 text-xl">🔓</div>
          <h3 className="text-sm font-semibold text-[#1F1D2B]">确认支付</h3>
          <p className="mt-0.5 text-xs text-[#6B6778]">{productName}</p>
        </div>

        <div className="mb-5 rounded-[4px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8FA] p-4 text-center">
          <div className="text-2xl font-bold text-[#9B7FBB]">¥{(amount / 100).toFixed(1)}</div>
        </div>

        <div className="space-y-2">
          <Button size="lg" className="w-full" loading={paying} onClick={handlePay}>
            微信支付 ¥{(amount / 100).toFixed(1)}
          </Button>
          <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
            稍后再说
          </Button>
        </div>
      </div>
    </div>
  );
}
