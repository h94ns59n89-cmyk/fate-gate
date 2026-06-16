'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { trackEvent, EVENTS } from '@/lib/analytics';
import { useUserStore } from '@/stores/userStore';

interface PayWallProps {
  reportId: number;
  userId: number;
  price?: number;
  compact?: boolean;
  productType?: string;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    WeixinJSBridge?: {
      invoke: (method: string, params: Record<string, string>, cb: (res: { err_msg: string }) => void) => void;
    };
  }
}

export function PayWall({ reportId, userId, price = 990, compact = false, onSuccess }: PayWallProps) {
  const [paying, setPaying] = useState(false);
  const token = useUserStore((s) => s.token);

  const handlePay = async () => {
    setPaying(true);
    trackEvent(EVENTS.PAY_CLICKED);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch('/api/v1/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          report_id: reportId,
          user_id: userId,
          product_type: 'FULL_REPORT',
          idempotency_key: `pay_${reportId}_${Date.now()}`,
        }),
      });

      const data = await response.json();
      if (data.code !== 0) {
        throw new Error(data.message);
      }

      const { order_no, pay_params } = data.data;

      if (typeof window.WeixinJSBridge !== 'undefined' && pay_params.paySign !== 'MOCK_SIGN_FOR_DEV') {
        window.WeixinJSBridge.invoke('getBrandWCPayRequest', pay_params, (res) => {
          if (res.err_msg === 'get_brand_wcpay_request:ok') {
            trackEvent(EVENTS.PAY_SUCCESS);
            onSuccess?.();
          } else {
            trackEvent(EVENTS.PAY_FAILED);
          }
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (order_no) {
          try {
            const payRes = await fetch(`/api/v1/orders/${order_no}/mock-pay`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
              },
            });
            const payData = await payRes.json();
            if (payData.code === 0) {
              trackEvent(EVENTS.PAY_SUCCESS);
              onSuccess?.();
            } else {
              trackEvent(EVENTS.PAY_FAILED);
            }
          } catch {
            trackEvent(EVENTS.PAY_FAILED);
          }
        } else {
          trackEvent(EVENTS.PAY_SUCCESS);
          onSuccess?.();
        }
      }
    } catch {
      trackEvent(EVENTS.PAY_FAILED);
    } finally {
      setPaying(false);
    }
  };

  if (compact) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-lg font-bold text-[#d4a853]">
              ¥{(price / 100).toFixed(1)}
              <span className="ml-1.5 text-xs font-normal text-[#858585]">/ 永久可查</span>
            </div>
            <p className="mt-0.5 text-xs text-[#6a6a6a]">
              支付即表示同意<Link href="/terms" className="underline text-[#858585] hover:text-[#d4d4d4]">用户协议</Link>
            </p>
          </div>
          <Button size="md" className="shrink-0" loading={paying} onClick={handlePay}>
            {paying ? '支付中...' : '立即解锁'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="vscode-card space-y-5 text-center">
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-[#d4d4d4]">解锁完整星隅报告</h3>
        <p className="text-sm text-[#858585]">10 页深度分析，全面了解你的人格</p>
      </div>

      <div className="border-y border-[#2a3040] py-4">
        <div className="text-2xl font-bold text-[#d4a853]">
          ¥{(price / 100).toFixed(1)}
          <span className="ml-1.5 text-xs font-normal text-[#858585]">/ 永久可查</span>
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
        支付即表示同意<Link href="/terms" className="underline text-[#858585] hover:text-[#d4d4d4]">用户协议</Link>
      </p>
    </div>
  );
}
