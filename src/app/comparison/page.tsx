'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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

  // Direct comparison mode
  const [hasReport, setHasReport] = useState<boolean | null>(null);
  const [userReportData, setUserReportData] = useState<{ bazi: Record<string, unknown>; tags: string[] } | null>(null);
  const [forceForm, setForceForm] = useState(false);

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

  useEffect(() => {
    const checkReport = async () => {
      const state = useUserStore.getState();
      const token = state.token;
      if (!token) { setHasReport(false); return; }
      try {
        const res = await fetch('/api/v1/users/me/reports', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.code === 0 && json.data?.items) {
          const completed = json.data.items.find(
            (item: { kind: string; status: string; bazi: unknown }) =>
              item.kind === 'personality' && item.status === 'completed' && item.bazi
          );
          if (completed) {
            setHasReport(true);
            setUserReportData({ bazi: completed.bazi, tags: completed.personality_tags ?? [] });
          } else {
            setHasReport(false);
          }
        } else {
          setHasReport(false);
        }
      } catch { setHasReport(false); }
    };
    checkReport();
  }, [userId]);

  const showDirectMode = hasReport === true && !forceForm;

  const handleDirectCompare = useCallback(async () => {
    if (!targetUser || !userReportData) return;
    setStep('generating');
    setCreateError('');
    try {
      const uid = userId ?? await initGuest();
      const compRes = await fetch('/api/v1/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: uid,
          target_user_id: targetUser.user_id,
          target_bazi: targetUser.bazi,
          user_bazi: userReportData.bazi,
          target_tags: targetUser.personality_tags,
          user_tags: userReportData.tags,
        }),
      });
      const compJson = await compRes.json();
      if (compJson.code !== 0) throw new Error(compJson.message ?? '合盘创建失败');
      trackEvent(EVENTS.COMPARISON_CREATED);
      router.push(`/comparison/${compJson.data.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '合盘创建失败');
      setStep('invite');
    }
  }, [targetUser, userReportData, userId, initGuest, router]);

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
      if (showDirectMode) return; // don't advance step in direct mode
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

  // Loading state while checking report
  if (hasReport === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="star-field" />

      <div className="relative z-10 px-4 pt-16">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Logo size="md" showText={false} />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wider text-[#9B7FBB]">
            人格对比
          </h1>
          <p className="mt-2 text-sm text-[#6B6778]">输入对方的邀请码，合盘分析你们的匹配度</p>
          <p className="mt-3 text-xs leading-relaxed text-[#8A8696] max-w-sm mx-auto">
            获取人格对比卡片、匹配度百分比、四维度分析（沟通/情感/价值观/成长）及相处建议
          </p>
        </div>

        {showDirectMode && step === 'invite' && !targetUser && (
          <div className="mx-auto max-w-md">
            <div className="mb-4 rounded-[10px] border border-[#8FCFA0]/30 bg-[#8FCFA0]/8 px-4 py-3 text-center">
              <p className="text-xs font-medium text-[#5BA06B]">检测到已有完整报告，可直接合盘</p>
            </div>
            <div className="vscode-card space-y-4">
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
                {inviteCodeError && <p className="mt-1 text-xs text-[#E05A5A]">{inviteCodeError}</p>}
              </div>

              {lookupError && (
                <p className="text-center text-xs text-[#E05A5A]">{lookupError}</p>
              )}

              <Button size="lg" className="w-full" onClick={handleLookup} loading={lookupLoading}>
                查找对方
              </Button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setForceForm(true)}
                className="text-xs text-[#8A8696] underline underline-offset-2 hover:text-[#6B6778]"
              >
                重新测试
              </button>
            </div>
          </div>
        )}

        {showDirectMode && targetUser && (
          <div className="mx-auto max-w-md space-y-5">
            <div className="vscode-card space-y-3">
              <p className="text-xs font-medium tracking-[0.03em] text-[#6B6778]">对方</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9B7FBB]/8 text-sm text-[#9B7FBB]">
                  ✦
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F1D2B]">{targetUser.nickname ?? '匿名用户'}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {targetUser.personality_tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="rounded-[3px] bg-[#9B7FBB]/8 px-2 py-0.5 text-[10px] text-[#9B7FBB]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {createError && <p className="text-center text-xs text-[#E05A5A]">{createError}</p>}

            <Button size="lg" className="w-full" onClick={handleDirectCompare}>
              直接合盘
            </Button>

            <div className="text-center">
              <button
                onClick={() => { setTargetUser(null); setInviteCode(''); }}
                className="text-xs text-[#8A8696] underline underline-offset-2 hover:text-[#6B6778]"
              >
                重新选择对方
              </button>
            </div>
          </div>
        )}

        {!showDirectMode && step === 'invite' && (
          <div className="mx-auto max-w-md">
            <div className="vscode-card space-y-4">
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
                {inviteCodeError && <p className="mt-1 text-xs text-[#E05A5A]">{inviteCodeError}</p>}
              </div>

              {lookupError && (
                <p className="text-center text-xs text-[#E05A5A]">{lookupError}</p>
              )}

              <Button size="lg" className="w-full" onClick={handleLookup} loading={lookupLoading}>
                查找对方
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-[#8A8696]">还没有对方的邀请码？</p>
              <p className="mt-1 text-xs text-[#6B6778]">让对方先完成测算，在结果页即可看到邀请码</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => router.push('/')}>
                先生成自己的报告
              </Button>
            </div>
          </div>
        )}

        {step === 'birth' && targetUser && (
          <div className="mx-auto max-w-md space-y-5">
            <div className="vscode-card space-y-3">
              <p className="text-xs font-medium tracking-[0.03em] text-[#6B6778]">对方</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9B7FBB]/8 text-sm text-[#9B7FBB]">
                  ✦
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F1D2B]">{targetUser.nickname ?? '匿名用户'}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {targetUser.personality_tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="rounded-[3px] bg-[#9B7FBB]/8 px-2 py-0.5 text-[10px] text-[#9B7FBB]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="vscode-card space-y-4">
              <p className="text-xs font-medium tracking-[0.03em] text-[#6B6778]">你的出生信息</p>

              <div>
                <label className="vscode-label">出生日期</label>
                <input type="date" required value={birthDate} onChange={(e) => { setBirthDate(e.target.value); if (formErrors?.birthDate) setFormErrors(null); }} className="vscode-input mt-1" />
                {formErrors?.birthDate && <p className="mt-1 text-xs text-[#E05A5A]">{formErrors.birthDate}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="vscode-label">出生时辰</label>
                  <select value={birthHour} onChange={(e) => setBirthHour(e.target.value)} className="vscode-select">
                    <option value="">未知</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i * 2}>
                        {['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][i]}时
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="vscode-label">分钟</label>
                  <select value={birthMinute} onChange={(e) => setBirthMinute(e.target.value)} className="vscode-select">
                    <option value="">未知</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i * 5}>{i * 5} 分</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="vscode-label">出生地点</label>
                <input type="text" required value={birthPlace} onChange={(e) => { setBirthPlace(e.target.value); if (formErrors?.birthPlace) setFormErrors(null); }} placeholder="例如：上海市黄浦区" className="vscode-input mt-1" />
                {formErrors?.birthPlace && <p className="mt-1 text-xs text-[#E05A5A]">{formErrors.birthPlace}</p>}
              </div>

              <div className="flex items-center gap-2.5">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" checked={isSolar} onChange={(e) => setIsSolar(e.target.checked)} className="peer sr-only" />
                  <div className="h-5 w-9 rounded-[3px] bg-[#E0E0E0] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-[2px] after:bg-[#FFFFFF] after:transition-all peer-checked:bg-[#9B7FBB]/30 peer-checked:after:translate-x-full peer-checked:after:bg-[#9B7FBB]" />
                </label>
                <span className="text-xs text-[#6B6778]">公历</span>
              </div>

              {createError && <p className="text-center text-xs text-[#E05A5A]">{createError}</p>}

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
              <p className="text-sm text-[#1F1D2B]">正在合盘分析...</p>
              <p className="mt-1 text-xs text-[#8A8696]">基于双方八字进行匹配度计算</p>
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
