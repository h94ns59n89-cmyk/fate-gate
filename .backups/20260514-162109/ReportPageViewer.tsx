'use client';

import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/common/Button';
import type { FullReport } from '@/lib/types';

interface ReportPageViewerProps {
  report: FullReport;
  onShare?: () => void;
}

const PAGES = [
  { key: 'cover', title: '封面' },
  { key: 'personality', title: '人格分析' },
  { key: 'career', title: '事业发展' },
  { key: 'relationships', title: '感情模式' },
  { key: 'health', title: '健康提示' },
  { key: 'current_year', title: '流年运势' },
  { key: 'decade_trend', title: '大运趋势' },
  { key: 'self_improvement', title: '成长建议' },
  { key: 'glossary', title: '术语解释' },
  { key: 'footer', title: '免责声明' },
];

export function ReportPageViewer({ report, onShare }: ReportPageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const pageHeight = containerRef.current.clientHeight;
    const page = Math.round(scrollTop / pageHeight);
    setCurrentPage(Math.min(page, PAGES.length - 1));
  }, []);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="scrollbar-hide h-[80vh] snap-y snap-mandatory overflow-y-auto"
      >
        {PAGES.map((page) => (
          <div
            key={page.key}
            className="flex h-[80vh] snap-start snap-always flex-col items-center justify-center p-6"
          >
            <div className="vscode-card w-full">
              <h2 className="mb-3 text-sm font-semibold text-[#d4a853]">{page.title}</h2>
              <div className="text-sm text-[#d4d4d4]/80">
                <p>此处显示 {page.title} 的详细内容...</p>
                <pre className="mt-3 rounded-[3px] border border-[#3c3c3c] bg-[#1e1e1e] p-3 text-xs text-[#858585] font-mono">
                  {JSON.stringify(report[page.key as keyof FullReport], null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-1.5 rounded-[4px] bg-[#252526] border border-[#3c3c3c] px-3 py-1.5">
          {PAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                containerRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`h-1.5 rounded-[2px] transition-all ${
                i === currentPage ? 'w-5 bg-[#d4a853]' : 'w-1.5 bg-[#858585]/40'
              }`}
              aria-label={`第 ${i + 1} 页`}
            />
          ))}
        </div>
      </div>

      {onShare && (
        <div className="sticky bottom-0 bg-gradient-to-t from-[#1e1e1e] via-[#1e1e1e]/90 to-transparent p-4 pt-8">
          <Button variant="outline" size="md" className="w-full" onClick={onShare}>
            分享报告
          </Button>
        </div>
      )}
    </div>
  );
}
