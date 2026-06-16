'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { trackEvent, EVENTS } from '@/lib/analytics';

interface PayWallProps {
  price?: number;
  onSuccess?: () => void;
}

export function PayWall({ price = 990, onSuccess }: PayWallProps) {
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    setPaying(true);
    trackEvent(EVENTS.PAY_CLICKED);

    try {
      // Mock payment flow
      await new Promise((resolve) => setTimeout(resolve, 1500));
      trackEvent(EVENTS.PAY_SUCCESS);
      onSuccess?.();
    } catch {
      trackEvent(EVENTS.PAY_FAILED);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="vscode-card space-y-5 text-center">
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-[#d4d4d4]">解锁完整人格报告</h3>
        <p className="text-sm text-[#858585]">10 页深度分析，全面了解你的命理人格</p>
      </div>

      <div className="border-y border-[#3c3c3c] py-4">
        <div className="text-2xl font-bold text-[#d4a853]">
          ¥{(price / 100).toFixed(1)}
          <span className="ml-1.5 text-xs font-normal text-[#858585]">/ 永久可查看</span>
        </div>
      </div>

      <ul className="space-y-1.5 text-left text-sm text-[#d4d4d4]/80">
        <li className="flex items-center gap-2">
          <span className="text-[#6a9955]">✓</span> 性格深度分析
        </li>
        <li className="flex items-center gap-2">
          <span className="text-[#6a9955]">✓</span> 事业发展建议
        </li>
        <li className="flex items-center gap-2">
          <span className="text-[#6a9955]">✓</span> 感情模式解读
        </li>
        <li className="flex items-center gap-2">
          <span className="text-[#6a9955]">✓</span> 流年运势洞察
        </li>
      </ul>

      <Button size="lg" className="w-full" loading={paying} onClick={handlePay}>
        {paying ? '支付中...' : '立即解锁 ¥9.9'}
      </Button>

      <p className="text-xs text-[#6a6a6a]">
        支付即表示同意 <span className="cursor-pointer underline text-[#858585] hover:text-[#d4d4d4]">用户协议</span>
      </p>
    </div>
  );
}
