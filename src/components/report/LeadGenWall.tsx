'use client';

import { useState, useEffect } from 'react';

interface LeadGenWallProps {
  reportId?: number;
  onSuccess?: () => void;
}

const LEAD_GEN_KEY = 'lead_unlocked_reports';

function getUnlockedReports(): Set<number> {
  try {
    const raw = localStorage.getItem(LEAD_GEN_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markUnlocked(reportId: number) {
  const set = getUnlockedReports();
  set.add(reportId);
  localStorage.setItem(LEAD_GEN_KEY, JSON.stringify([...set]));
}

export function LeadGenWall({ reportId, onSuccess }: LeadGenWallProps) {
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (reportId && getUnlockedReports().has(reportId)) {
      setSubmitted(true);
      onSuccess?.();
    }
  }, [reportId, onSuccess]);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('请输入助理微信号');
      return;
    }
    setError('');
    if (reportId) markUnlocked(reportId);
    setSubmitted(true);
    onSuccess?.();
  };

  if (submitted) return null;

  return (
    <div className="mx-auto max-w-md px-4 py-5">
      <div className="rounded-[8px] border border-[#9B7FBB]/20 bg-gradient-to-b from-[#F8F6FF] to-[#FFFFFF] p-5 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#9B7FBB]/10">
          <svg className="h-6 w-6 text-[#9B7FBB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        </div>

        <h3 className="text-base font-semibold text-[#1F1D2B]">解锁完整星隅报告</h3>
        <p className="mt-1 text-sm text-[#6B6778]">添加助理微信，获取 10 页深度人格分析</p>

        <div className="mt-4 rounded-[6px] border border-dashed border-[#9B7FBB]/30 bg-[#FFFFFF] px-4 py-3">
          <p className="text-xs font-medium text-[#8A8696]">助理微信号</p>
          <p className="mt-0.5 text-lg font-bold tracking-wide text-[#9B7FBB]">Willa106</p>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs text-[#6B6778]">添加后请在此输入助理微信号确认</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="输入 Willa106"
              className="min-w-0 flex-1 rounded-[6px] border border-[rgba(0,0,0,0.12)] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#1F1D2B] outline-none transition-colors placeholder:text-[#8A8696] focus:border-[#9B7FBB] focus:ring-1 focus:ring-[#9B7FBB]/20"
            />
            <button
              onClick={handleSubmit}
              className="flex-shrink-0 rounded-[6px] bg-[#9B7FBB] px-4 py-2.5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#8A6EAA] active:scale-95"
            >
              确认解锁
            </button>
          </div>
          {error && <p className="text-xs text-[#E05A5A]">{error}</p>}
        </div>

        <p className="mt-4 text-[11px] text-[#8A8696]">
          添加后助理将在 24 小时内为你解锁完整报告
        </p>
      </div>
    </div>
  );
}
