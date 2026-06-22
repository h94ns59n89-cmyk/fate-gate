'use client';

import { useState } from 'react';

interface LeadGenWallProps {
  context: string;
}

export function LeadGenWall({ context }: LeadGenWallProps) {
  const [copied, setCopied] = useState(false);
  const wechatId = 'Willa106';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wechatId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="rounded-[12px] border border-[#9B7FBB]/15 bg-gradient-to-b from-[#F8F6FF] to-[#FFFFFF] p-6 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#9B7FBB]/10">
        <svg className="h-7 w-7 text-[#9B7FBB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-[#1F1D2B]">获取{context}</h3>
      <p className="mt-1.5 text-sm text-[#6B6778]">添加助理微信，免费获取深度分析与成长建议</p>

      <div className="mt-5 inline-flex items-center gap-3 rounded-[8px] border border-dashed border-[#9B7FBB]/25 bg-[#FFFFFF] px-5 py-3 shadow-sm">
        <span className="text-xs font-medium text-[#8A8696]">微信号</span>
        <span className="text-lg font-bold tracking-wider text-[#9B7FBB]">{wechatId}</span>
        <button
          onClick={handleCopy}
          className="rounded-[6px] bg-[#9B7FBB] px-3 py-1.5 text-xs font-medium text-[#FFFFFF] transition-colors hover:bg-[#8A6EAA] active:scale-95"
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      <p className="mt-4 text-[11px] text-[#8A8696]">添加后助理将在 24 小时内为你发送{context}</p>
    </div>
  );
}
