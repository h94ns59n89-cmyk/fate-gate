'use client';

import Image from 'next/image';
import { Button } from '@/components/common/Button';

interface ShareCardProps {
  imageUrl?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export function ShareCard({ imageUrl, onDownload, onShare }: ShareCardProps) {
  return (
    <div className="space-y-4">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="分享卡片"
          width={400}
          height={300}
          className="w-full rounded-[4px]"
        />
      ) : (
        <div className="flex h-60 items-center justify-center rounded-[4px] border border-[#3c3c3c] bg-[#2d2d2d]">
          <p className="text-xs text-[#6a6a6a]">卡片生成中...</p>
        </div>
      )}

      <div className="flex gap-2">
        {onDownload && (
          <Button variant="outline" size="md" className="flex-1" onClick={onDownload}>
            保存到相册
          </Button>
        )}
        {onShare && (
          <Button size="md" className="flex-1" onClick={onShare}>
            分享给好友
          </Button>
        )}
      </div>
    </div>
  );
}
