'use client';

import { useState, useCallback } from 'react';
import type { BaziCalculationMeta, FiveElements } from '@/lib/types';

interface BaziInput {
  birthDate: string;
  birthHour: number | null;
  birthMinute: number | null;
  birthPlace: string | null;
  userId: number | null;
  isSolarCalendar?: boolean;
  longitude?: number;
  latitude?: number;
}

export interface BaziResult {
  bazi: Record<string, unknown>;
  fiveElements: FiveElements;
  dayMaster: string;
  personalityTags: string[];
  coreTraits: string[];
  lifeTheme: string;
  fiveElementsSummary?: string;
  dayMasterElement?: string;
  calculationMeta?: BaziCalculationMeta | undefined;
  birthInfoId: number;
  reportId: number;
}

export function useBaziCalculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async (input: BaziInput): Promise<BaziResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/bazi/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birth_date: input.birthDate,
          birth_hour: input.birthHour,
          birth_minute: input.birthMinute,
          birth_place: input.birthPlace,
          user_id: input.userId,
          is_solar_calendar: input.isSolarCalendar ?? true,
          longitude: input.longitude,
          latitude: input.latitude,
        }),
      });

      const data = await response.json();
      if (data.code !== 0) {
        throw new Error(data.message);
      }

      return {
        bazi: data.data.bazi,
        fiveElements: data.data.five_elements,
        dayMaster: data.data.day_master,
        dayMasterElement: data.data.day_master_element,
        personalityTags: data.data.personality_tags,
        coreTraits: data.data.core_traits,
        lifeTheme: data.data.life_theme,
        fiveElementsSummary: data.data.five_elements_summary,
        calculationMeta: data.data.calculation_meta,
        birthInfoId: data.data.birth_info_id ?? 0,
        reportId: data.data.report_id ?? 0,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : '排盘计算失败';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { calculate, loading, error };
}
