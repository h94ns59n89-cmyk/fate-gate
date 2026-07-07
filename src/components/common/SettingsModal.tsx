'use client';

import { useEffect } from 'react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(31,29,43,0.3)] backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-[360px] max-w-[90vw] rounded-[16px] bg-[#FFFFFF] px-7 pb-7 pt-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(155,127,187,0.1)]">
          <svg className="h-[22px] w-[22px] text-[#9B7FBB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <div className="mb-2 text-[16px] font-semibold text-[#1F1D2B]">模型配置</div>
        <p className="mb-5 text-[13px] leading-relaxed text-[#6B6778]">
          模型配置仅在桌面版可用<br />
          请下载桌面版进行设置
        </p>
        <div className="flex flex-col gap-2">
          <button
            className="inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-[#9B7FBB] text-[13px] font-medium text-[#FFFFFF] transition-colors hover:bg-[#8A6EAA]"
            onClick={() => {
              // TODO: trigger download
            }}
          >
            下载桌面版
          </button>
          <button
            className="inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-transparent text-[12px] text-[#8A8696] transition-colors hover:text-[#1F1D2B]"
            onClick={onClose}
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}
