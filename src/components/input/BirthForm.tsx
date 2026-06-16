'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { trackEvent, EVENTS } from '@/lib/analytics';

interface BirthFormData {
  birthDate: string;
  birthHour: string;
  birthMinute: string;
  birthPlace: string;
  isSolarCalendar: boolean;
}

interface BirthFormProps {
  onSubmit: (data: BirthFormData) => void;
  loading?: boolean;
}

export function BirthForm({ onSubmit, loading = false }: BirthFormProps) {
  const [formData, setFormData] = useState<BirthFormData>({
    birthDate: '',
    birthHour: '',
    birthMinute: '',
    birthPlace: '',
    isSolarCalendar: true,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    trackEvent(EVENTS.FORM_COMPLETE);
    onSubmit(formData);
  };

  const handleFocus = () => {
    trackEvent(EVENTS.FORM_START);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" onFocus={handleFocus}>
      <div>
        <label htmlFor="birth-date" className="vscode-label">
          出生日期 <span className="text-[#f44747]">*</span>
        </label>
        <input
          id="birth-date"
          type="date"
          required
          aria-required="true"
          aria-describedby="birth-hint"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          className="vscode-input"
          min="1900-01-01"
          max="2100-12-31"
        />
        <span id="birth-hint" className="mt-1 block text-xs text-[#6a6a6a]">
          请输入公历出生日期
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="birth-hour" className="vscode-label">
            出生时辰
          </label>
          <select
            id="birth-hour"
            value={formData.birthHour}
            onChange={(e) => setFormData({ ...formData, birthHour: e.target.value })}
            className="vscode-select"
          >
            <option value="" className="bg-[#1e1e1e]">
              未知
            </option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i * 2} className="bg-[#1e1e1e]">
                {['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][i]}时
                ({i * 2}:00-{i * 2 + 1}:59)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="birth-minute" className="vscode-label">
            分钟
          </label>
          <select
            id="birth-minute"
            value={formData.birthMinute}
            onChange={(e) => setFormData({ ...formData, birthMinute: e.target.value })}
            className="vscode-select"
          >
            <option value="" className="bg-[#1e1e1e]">
              未知
            </option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i * 5} className="bg-[#1e1e1e]">
                {i * 5} 分
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="birth-place" className="vscode-label">
          出生地点
        </label>
        <input
          id="birth-place"
          type="text"
          required
          aria-required="true"
          value={formData.birthPlace}
          onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
          placeholder="例如：上海市黄浦区南京东路 / 北京朝阳区三里屯 / Paris 7e"
          className="vscode-input"
        />
        <span className="mt-1 block text-xs text-[#6a6a6a]">
          只需填写详细地址，系统会自动匹配经纬度并换算真太阳时
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={formData.isSolarCalendar}
            onChange={(e) => setFormData({ ...formData, isSolarCalendar: e.target.checked })}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-[3px] bg-[#3c3c3c] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-[2px] after:bg-[#858585] after:transition-all peer-checked:bg-[#d4a853]/30 peer-checked:after:translate-x-full peer-checked:after:bg-[#d4a853]" />
        </label>
        <span className="text-xs text-[#858585]">公历</span>
      </div>

      <Button type="submit" loading={loading} size="lg" className="w-full">
        开始测算
      </Button>
    </form>
  );
}
