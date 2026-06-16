'use client';

import { useState } from 'react';
import { ComparisonCard } from '@/components/comparison/ComparisonCard';
import { Button } from '@/components/common/Button';
import { trackEvent, EVENTS } from '@/lib/analytics';

export default function ComparisonPage() {
  const [step, setStep] = useState<'input' | 'result'>('input');

  const handleCreateComparison = async () => {
    trackEvent(EVENTS.COMPARISON_CREATED);
    setStep('result');
  };

  return (
    <div className="min-h-screen px-4 pb-[60px] pt-14">
      <div className="mb-6 text-center">
        <h1 className="mb-1 text-xl font-semibold text-[#d4d4d4]">人格对比</h1>
        <p className="text-xs text-[#858585]">看看你和TA的匹配程度</p>
      </div>

      {step === 'input' && (
        <div className="space-y-4">
          <div className="vscode-card">
            <h3 className="vscode-label mb-3">输入对方的邀请码</h3>
            <input
              type="text"
              placeholder="对方的邀请码"
              className="vscode-input mb-3"
            />
            <Button size="lg" className="w-full" onClick={handleCreateComparison}>
              开始对比
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-[#6a6a6a]">还没有对方的邀请码？</p>
            <Button variant="ghost" size="sm" className="mt-1">
              先生成自己的报告
            </Button>
          </div>
        </div>
      )}

      {step === 'result' && (
        <ComparisonCard
          userTag="甲木型・领导者人格"
          targetTag="乙木型・谋略家人格"
          matchScore={85}
          onShare={() => trackEvent(EVENTS.SUMMARY_SHARED)}
        />
      )}
    </div>
  );
}
