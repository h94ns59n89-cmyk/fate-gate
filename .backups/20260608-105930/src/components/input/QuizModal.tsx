'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/common/Button';
import { trackEvent, EVENTS } from '@/lib/analytics';
import { QUIZ_QUESTIONS, computeGuessedHour } from '@/data/quizQuestions';
import type { TimeGuessResult } from '@/lib/types';

interface QuizModalProps {
  open: boolean;
  onComplete: (result: TimeGuessResult) => void;
  onClose: () => void;
}

export function QuizModal({ open, onComplete, onClose }: QuizModalProps) {
  const [step, setStep] = useState<'quiz' | 'result'>('quiz');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: number; optionId: number }>>([]);
  const [guessResult, setGuessResult] = useState<TimeGuessResult | null>(null);

  const handleSelect = useCallback((optionId: number) => {
    const question = QUIZ_QUESTIONS[currentQ];
    if (!question) return;

    const newAnswers = [...answers, { questionId: question.id, optionId }];
    setAnswers(newAnswers);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      trackEvent(EVENTS.TIME_UNKNOWN);
      const result = computeGuessedHour(newAnswers);
      setGuessResult(result);
      setStep('result');
    }
  }, [currentQ, answers]);

  const handleConfirm = useCallback(() => {
    if (guessResult) {
      onComplete(guessResult);
    }
  }, [guessResult, onComplete]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-[6px] border-t border-[#3c3c3c] bg-[#252526] px-5 pb-8 pt-5 shadow-modal">
        {step === 'quiz' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#d4d4d4]">出生时辰推测</h2>
              <button
                onClick={onClose}
                className="rounded-[3px] p-1 text-[#858585] hover:bg-[#2a2d2e] hover:text-[#d4d4d4]"
                aria-label="关闭"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex gap-1">
              {QUIZ_QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-[2px] transition-colors ${
                    i <= currentQ ? 'bg-[#d4a853]' : 'bg-[#3c3c3c]'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-[#6a6a6a]">
              {currentQ + 1} / {QUIZ_QUESTIONS.length}
            </p>

            {QUIZ_QUESTIONS[currentQ] && (
              <div className="space-y-3" key={currentQ}>
                <p className="text-sm text-[#d4d4d4]">
                  {QUIZ_QUESTIONS[currentQ].question}
                </p>
                <div className="space-y-1.5">
                  {QUIZ_QUESTIONS[currentQ].options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      className="w-full rounded-[3px] border border-[#3c3c3c] px-3 py-2.5 text-left text-sm text-[#d4d4d4]/80 transition-all hover:border-[#d4a853]/40 hover:bg-[#d4a853]/5 hover:text-[#d4d4d4]"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'result' && guessResult && (
          <div className="space-y-5 text-center">
            <div className="mx-auto w-fit rounded-[4px] bg-[#d4a853]/15 p-3">
              <svg className="h-6 w-6 text-[#d4a853]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#d4d4d4]">推测完成</h2>
              <p className="mt-1 text-sm text-[#858585]">
                根据你的回答，我们推测你的出生时辰为
              </p>
            </div>

            <div className="rounded-[4px] border border-[#3c3c3c] bg-[#2d2d2d] p-4">
              <p className="text-2xl font-bold text-[#d4a853]">{guessResult.label}时</p>
              <p className="mt-1 text-xs text-[#858585]">
                ({String(guessResult.hour).padStart(2, '0')}:00-{String(guessResult.hour + 1).padStart(2, '0')}:59)
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="h-1 w-20 overflow-hidden rounded-[2px] bg-[#3c3c3c]">
                  <div
                    className="h-full rounded-[2px] bg-[#d4a853] transition-all"
                    style={{ width: `${guessResult.confidence}%` }}
                  />
                </div>
                <span className="text-xs text-[#858585]">{guessResult.confidence}% 匹配</span>
              </div>
            </div>

            <p className="text-xs text-[#6a6a6a]">
              *推测结果仅供参考，准确出生时辰可获得更精准的分析
            </p>

            <Button size="lg" className="w-full" onClick={handleConfirm}>
              开始命理分析
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
