'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Logo } from '@/components/common/Logo';
import { QuizModal } from '@/components/input/QuizModal';
import { useBaziCalculator } from '@/hooks/useBaziCalculator';
import { useUserStore } from '@/stores/userStore';
import { trackEvent, EVENTS } from '@/lib/analytics';
import { validateInviteCode, validateBirthForm } from '@/lib/client-validation';
import type { TimeGuessResult } from '@/lib/types';

type Step = 'invite' | 'birth' | 'generating';

export default function ComparisonPage() {
  const router = useRouter();
  const userId = useUserStore((s) => s.userId);
  const initGuest = useUserStore((s) => s.initGuest);
  const { calculate, loading: calcLoading } = useBaziCalculator();

  const [step, setStep] = useState<Step>('invite');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteCodeError, setInviteCodeError] = useState('');
  const [targetUser, setTargetUser] = useState<{
    user_id: number; nickname: string | null; personality_tags: string[]; bazi: Record<string, unknown>;
  } | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  // Birth form state
  const [birthDate, setBirthDate] = useState('');
  const [birthHour, setBirthHour] = useState('');
  const [birthMinute, setBirthMinute] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [isSolar, setIsSolar] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string> | null>(null);

  const setValidationErrors = (errors: Record<string, string | undefined>) => {
    const defined: Record<string, string> = {};
    for (const [k, v] of Object.entries(errors)) { if (v) defined[k] = v; }
    setFormErrors(Object.keys(defined).length ? defined : null);
  };
  const [createError, setCreateError] = useState('');

  // Quiz modal state
  const [showQuiz, setShowQuiz] = useState(false);
  const pendingFormRef = useRef<{
    birthDate: string; birthMinute: string; birthPlace: string; isSolar: boolean;
  } | null>(null);

  const handleLookup = async () => {
    const code = inviteCode.trim();
    const codeError = validateInviteCode(code);
    if (codeError) {
      setInviteCodeError(codeError);
      return;
    }
    setInviteCodeError('');
    setLookupLoading(true);
    setLookupError('');
    try {
      const res = await fetch(`/api/v1/users/by-invite-code/${code}`);
      const json = await res.json();
      if (json.code !== 0) throw new Error(json.message ?? '未找到用户');
      setTargetUser(json.data);
      setStep('birth');
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : '查找失败');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCompare = useCallback(async (guessedHour?: number) => {
    if (!targetUser) return;
    setFormErrors(null);

    const validationErrors = validateBirthForm({ birthDate, birthPlace });
    if (validationErrors.birthDate || validationErrors.birthPlace) {
      setValidationErrors(validationErrors as Record<string, string | undefined>);
      return;
    }

    if (!birthHour && guessedHour == null) {
      pendingFormRef.current = { birthDate, birthMinute, birthPlace, isSolar };
      setShowQuiz(true);
      return;
    }

    setStep('generating');
    setCreateError('');

    try {
      const uid = userId ?? await initGuest();

      const hour = guessedHour ?? (birthHour ? parseInt(birthHour) : 12);
      const ownResult = await calculate({
        birthDate,
        birthHour: hour,
        birthMinute: birthMinute ? parseInt(birthMinute) : null,
        birthPlace: birthPlace || null,
        isSolarCalendar: isSolar,
        userId: uid,
      });

      if (!ownResult) throw new Error('排盘计算失败');

      const compRes = await fetch('/api/v1/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: uid,
          target_user_id: targetUser.user_id,
          target_bazi: targetUser.bazi,
          user_bazi: {
            dayMaster: ownResult.dayMaster,
            dayMasterElement: ownResult.dayMasterElement,
            pillars: {
              year: ownResult.bazi.year_pillar,
              month: ownResult.bazi.month_pillar,
              day: ownResult.bazi.day_pillar,
              hour: ownResult.bazi.hour_pillar,
            },
            fiveElements: ownResult.fiveElements,
            calculationMeta: ownResult.calculationMeta,
          },
          target_tags: targetUser.personality_tags,
          user_tags: ownResult.personalityTags,
        }),
      });

      const compJson = await compRes.json();
      if (compJson.code !== 0) throw new Error(compJson.message ?? '合盘创建失败');

      trackEvent(EVENTS.COMPARISON_CREATED);
      router.push(`/comparison/${compJson.data.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '合盘创建失败');
      setStep('birth');
    }
  }, [targetUser, userId, initGuest, calculate, birthDate, birthHour, birthMinute, birthPlace, isSolar, router]);

  const handleQuizComplete = useCallback((guess: TimeGuessResult) => {
    setShowQuiz(false);
    const pending = pendingFormRef.current;
    if (pending) {
      handleCompare(guess.hour);
      pendingFormRef.current = null;
    }
  }, [handleCompare]);

  return (
    <div className="relative min-h-screen">
      <div className="star-field" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#0B0E14]/60 via-[#111827]/40 to-[#0B0E14]/80 pointer-events-none z-[1]" />

      <div className="relative z-10 px-4 pb-[60px] pt-14">
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <Logo size="md" showText={false} />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wider text-[#d4a853]">
            人格对比
          </h1>
          <p className="mt-1 text-xs text-[#858585]">输入对方的邀请码，合盘分析你们的匹配度</p>
        </div>

        {step === 'invite' && (
          <div className="mx-auto max-w-md">
            <div className="glass-card space-y-4">
              <div>
                <label className="vscode-label">对方的邀请码</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    if (inviteCodeError) setInviteCodeError('');
                  }}
                  placeholder="例如：u_12345"
                  className="vscode-input mt-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                />
                {inviteCodeError && <p className="mt-1 text-xs text-[#f44747]">{inviteCodeError}</p>}
              </div>

              {lookupError && (
                <p className="text-center text-xs text-[#f44747]">{lookupError}</p>
              )}

              <Button size="lg" className="w-full" onClick={handleLookup} loading={lookupLoading}>
                查找对方
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-[#6a6a6a]">还没有对方的邀请码？</p>
              <p className="mt-1 text-xs text-[#858585]">让对方先完成测算，在结果页即可看到邀请码</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => router.push('/')}>
                先生成自己的报告
              </Button>
            </div>
          </div>
        )}

        {step === 'birth' && targetUser && (
          <div className="mx-auto max-w-md space-y-5">
            <div className="glass-card space-y-3">
              <p className="text-xs font-medium text-[#858585]">对方</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4a853]/15 text-base text-[#d4a853]">
                  ✦
                </div>
                <div>
                  <p className="text-sm font-medium text-[#d4d4d4]">{targetUser.nickname ?? '匿名用户'}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {targetUser.personality_tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="rounded-[3px] bg-[#d4a853]/10 px-2 py-0.5 text-[10px] text-[#d4a853]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card space-y-4">
              <p className="text-xs font-medium text-[#858585]">你的出生信息</p>

              <div>
                <label className="vscode-label">出生日期</label>
                <input type="date" required value={birthDate} onChange={(e) => { setBirthDate(e.target.value); if (formErrors?.birthDate) setFormErrors(null); }} className="vscode-input mt-1" />
                {formErrors?.birthDate && <p className="mt-1 text-xs text-[#f44747]">{formErrors.birthDate}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="vscode-label">出生时辰</label>
                  <select value={birthHour} onChange={(e) => setBirthHour(e.target.value)} className="vscode-select">
                    <option value="" className="bg-[#0B0E14]">未知</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i * 2} className="bg-[#0B0E14]">
                        {['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][i]}时
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="vscode-label">分钟</label>
                  <select value={birthMinute} onChange={(e) => setBirthMinute(e.target.value)} className="vscode-select">
                    <option value="" className="bg-[#0B0E14]">未知</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i * 5} className="bg-[#0B0E14]">{i * 5} 分</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="vscode-label">出生地点</label>
                <input type="text" required value={birthPlace} onChange={(e) => { setBirthPlace(e.target.value); if (formErrors?.birthPlace) setFormErrors(null); }} placeholder="例如：上海市黄浦区" className="vscode-input mt-1" />
                {formErrors?.birthPlace && <p className="mt-1 text-xs text-[#f44747]">{formErrors.birthPlace}</p>}
              </div>

              <div className="flex items-center gap-2.5">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" checked={isSolar} onChange={(e) => setIsSolar(e.target.checked)} className="peer sr-only" />
                  <div className="h-5 w-9 rounded-[3px] bg-[#2a3040] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-[2px] after:bg-[#858585] after:transition-all peer-checked:bg-[#d4a853]/30 peer-checked:after:translate-x-full peer-checked:after:bg-[#d4a853]" />
                </label>
                <span className="text-xs text-[#858585]">公历</span>
              </div>

              {createError && <p className="text-center text-xs text-[#f44747]">{createError}</p>}

              <Button size="lg" className="w-full" onClick={() => handleCompare()} loading={calcLoading}>
                开始合盘分析
              </Button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center gap-6 py-24">
            <Logo size="md" showText={false} />
            <LoadingSpinner size="lg" />
            <div className="text-center">
              <p className="text-sm text-[#d4d4d4]">正在合盘分析...</p>
              <p className="mt-1 text-xs text-[#6a6a6a]">基于双方八字进行匹配度计算</p>
            </div>
          </div>
        )}
      </div>

      <QuizModal
        open={showQuiz}
        onComplete={handleQuizComplete}
        onClose={() => setShowQuiz(false)}
        onSkip={() => {
          setShowQuiz(false);
          pendingFormRef.current = null;
          handleCompare(12);
        }}
      />
    </div>
  );
}
