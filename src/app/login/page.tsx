'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/stores/userStore';


export default function LoginPage() {
  const router = useRouter();
  const loginStore = useUserStore((s) => s.loginWithPassword);
  const currentUserId = useUserStore((s) => s.userId);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!username || !password) { setError('请输入用户名和密码'); return; }
      setLoading(true);
      setError('');
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, guest_user_id: currentUserId }),
      });
      const json = await res.json();
      if (json.code === 0 && json.data) {
        const d = json.data;
        loginStore(d.token, d.user_id, { id: d.user_id, nickname: d.nickname, avatar_url: d.avatar_url, is_new_user: false, has_report: true, report_count: 0 });
        router.push('/');
      } else {
        setError(json.message || '登录失败');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen flex-col bg-[#FAF8F5]">
      {/* Soft nebula background light */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        <div className="absolute left-[-5%] top-[-8%] h-[55%] w-[45%] rounded-full bg-gradient-to-br from-[#F7C8E0]/25 via-[#BFA8E8]/12 to-transparent blur-[120px]" />
        <div className="absolute right-[-10%] top-[25%] h-[45%] w-[40%] rounded-full bg-gradient-to-bl from-[#C9A88D]/15 via-[#9B7FBB]/8 to-transparent blur-[100px]" />
        <div className="absolute left-[15%] bottom-[-5%] h-[40%] w-[35%] rounded-full bg-gradient-to-tr from-[#BFA8E8]/12 via-[#F7C8E0]/8 to-transparent blur-[90px]" />

        {/* Flowing curves — sweeping arcs across the page */}
        <svg className="absolute left-[-8%] top-[5%] h-[70%] w-[60%]" viewBox="0 0 500 500" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M20 250 Q100 80 220 150 T400 120" stroke="url(#curveGrad1)" strokeWidth="1.2" fill="none" opacity="0.5" />
          <path d="M20 250 Q100 80 220 150 T400 120" stroke="url(#curveGlow)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeDasharray="100 250" className="flow-c" opacity="0.55" style={{ animationDelay: '0s' }} />
          <path d="M0 300 Q80 150 200 200 T450 180" stroke="url(#curveGrad1)" strokeWidth="0.9" fill="none" opacity="0.35" />
          <path d="M0 300 Q80 150 200 200 T450 180" stroke="url(#curveGlow)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeDasharray="80 270" className="flow-c" opacity="0.45" style={{ animationDelay: '0.6s' }} />
          <path d="M50 100 Q150 50 250 100 T420 60" stroke="url(#curveGrad2)" strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M50 100 Q150 50 250 100 T420 60" stroke="url(#curveGlow)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeDasharray="90 260" className="flow-c" opacity="0.5" style={{ animationDelay: '1.2s' }} />
          <path d="M-20 400 Q60 280 180 320 T380 280" stroke="url(#curveGrad2)" strokeWidth="0.7" fill="none" opacity="0.3" />
          <path d="M-20 400 Q60 280 180 320 T380 280" stroke="url(#curveGlow)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeDasharray="70 280" className="flow-c" opacity="0.4" style={{ animationDelay: '0.3s' }} />
          <defs>
            <linearGradient id="curveGrad1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F7C8E0" stopOpacity="0" />
              <stop offset="35%" stopColor="#F7C8E0" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#BFA8E8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#BFA8E8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="curveGrad2" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#C9A88D" stopOpacity="0" />
              <stop offset="40%" stopColor="#C9A88D" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#9B7FBB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#9B7FBB" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="curveGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFF8FC" stopOpacity="0" />
              <stop offset="20%" stopColor="#FFF8FC" stopOpacity="0" />
              <stop offset="35%" stopColor="#FFF8FC" stopOpacity="0.7" />
              <stop offset="55%" stopColor="#FFF8FC" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#FFF8FC" stopOpacity="0" />
              <stop offset="100%" stopColor="#FFF8FC" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Right-side sweeping curves */}
        <svg className="absolute right-[-10%] top-[30%] h-[55%] w-[50%]" viewBox="0 0 400 400" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M300 50 Q200 120 280 220 T200 350" stroke="url(#curveGrad3)" strokeWidth="1.2" fill="none" opacity="0.45" />
          <path d="M300 50 Q200 120 280 220 T200 350" stroke="url(#curveGlow2)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeDasharray="90 230" className="flow-d" opacity="0.55" style={{ animationDelay: '0s' }} />
          <path d="M350 100 Q250 170 320 270 T240 380" stroke="url(#curveGrad3)" strokeWidth="0.8" fill="none" opacity="0.3" />
          <path d="M350 100 Q250 170 320 270 T240 380" stroke="url(#curveGlow2)" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeDasharray="70 250" className="flow-d" opacity="0.45" style={{ animationDelay: '0.8s' }} />
          <path d="M280 20 Q180 90 260 190 T180 320" stroke="url(#curveGrad4)" strokeWidth="0.9" fill="none" opacity="0.35" />
          <path d="M280 20 Q180 90 260 190 T180 320" stroke="url(#curveGlow2)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="80 240" className="flow-d" opacity="0.5" style={{ animationDelay: '1.6s' }} />
          <defs>
            <linearGradient id="curveGrad3" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#BFA8E8" stopOpacity="0" />
              <stop offset="50%" stopColor="#BFA8E8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F7C8E0" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="curveGrad4" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#9B7FBB" stopOpacity="0" />
              <stop offset="50%" stopColor="#9B7FBB" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C9A88D" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="curveGlow2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF8FC" stopOpacity="0" />
              <stop offset="20%" stopColor="#FFF8FC" stopOpacity="0" />
              <stop offset="35%" stopColor="#FFF8FC" stopOpacity="0.65" />
              <stop offset="55%" stopColor="#FFF8FC" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#FFF8FC" stopOpacity="0" />
              <stop offset="100%" stopColor="#FFF8FC" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Circular arc accents — subtle ring fragments */}
        <svg className="absolute left-[55%] top-[10%] h-28 w-28" viewBox="0 0 100 100" fill="none">
          <path d="M20 50 A30 30 0 0 1 80 50" stroke="#F7C8E0" strokeWidth="1" fill="none" opacity="0.35" />
          <path d="M20 50 A30 30 0 0 1 80 50" stroke="#FFF8FC" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeDasharray="30 80" className="flow-e" opacity="0.45" style={{ animationDelay: '0s' }} />
          <path d="M15 50 A35 35 0 0 1 85 50" stroke="#BFA8E8" strokeWidth="0.7" fill="none" opacity="0.25" />
        </svg>
        <svg className="absolute right-[20%] bottom-[20%] h-20 w-20" viewBox="0 0 80 80" fill="none">
          <path d="M10 40 A30 30 0 0 0 70 40" stroke="#C9A88D" strokeWidth="0.8" fill="none" opacity="0.3" />
          <path d="M10 40 A30 30 0 0 0 70 40" stroke="#FFF8FC" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeDasharray="25 70" className="flow-e" opacity="0.4" style={{ animationDelay: '1s' }} />
        </svg>
        <svg className="absolute left-[8%] bottom-[35%] h-16 w-16" viewBox="0 0 60 60" fill="none">
          <path d="M20 10 A25 25 0 0 0 20 50" stroke="#BFA8E8" strokeWidth="0.9" fill="none" opacity="0.3" />
          <path d="M20 10 A25 25 0 0 0 20 50" stroke="#FFF8FC" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="20 60" className="flow-e" opacity="0.4" style={{ animationDelay: '0.5s' }} />
        </svg>

        {/* Scattered stars */}
        <svg className="absolute left-[10%] top-[15%] h-5 w-5 text-[#9B7FBB]/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 2l1.2 4.4 4.8.6-3.6 3.2 1 4.8L12 12l-4.4 2 1-4.8L5 7l4.8-.6z" />
        </svg>
        <svg className="absolute right-[15%] top-[12%] h-3.5 w-3.5 text-[#C9A88D]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 2l1.2 4.4 4.8.6-3.6 3.2 1 4.8L12 12l-4.4 2 1-4.8L5 7l4.8-.6z" />
        </svg>
        <svg className="absolute left-[40%] top-[8%] h-2.5 w-2.5 text-[#9B7FBB]/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 2l1.2 4.4 4.8.6-3.6 3.2 1 4.8L12 12l-4.4 2 1-4.8L5 7l4.8-.6z" />
        </svg>
        <svg className="absolute left-[5%] top-[45%] h-4 w-4 text-[#9B7FBB]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 2l1.2 4.4 4.8.6-3.6 3.2 1 4.8L12 12l-4.4 2 1-4.8L5 7l4.8-.6z" />
        </svg>
        <svg className="absolute right-[8%] top-[50%] h-3 w-3 text-[#C9A88D]/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 2l1.2 4.4 4.8.6-3.6 3.2 1 4.8L12 12l-4.4 2 1-4.8L5 7l4.8-.6z" />
        </svg>
        <svg className="absolute left-[20%] bottom-[20%] h-4 w-4 text-[#9B7FBB]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 2l1.2 4.4 4.8.6-3.6 3.2 1 4.8L12 12l-4.4 2 1-4.8L5 7l4.8-.6z" />
        </svg>
        <svg className="absolute right-[25%] bottom-[15%] h-2.5 w-2.5 text-[#C9A88D]/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 2l1.2 4.4 4.8.6-3.6 3.2 1 4.8L12 12l-4.4 2 1-4.8L5 7l4.8-.6z" />
        </svg>
        <svg className="absolute right-[5%] top-[70%] h-3 w-3 text-[#9B7FBB]/18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 2l1.2 4.4 4.8.6-3.6 3.2 1 4.8L12 12l-4.4 2 1-4.8L5 7l4.8-.6z" />
        </svg>

        {/* Dots */}
        <div className="absolute left-[18%] top-[28%] h-[5px] w-[5px] rounded-full bg-[#9B7FBB]/25" />
        <div className="absolute right-[22%] top-[22%] h-[4px] w-[4px] rounded-full bg-[#C9A88D]/25" />
        <div className="absolute left-[55%] top-[18%] h-[5px] w-[5px] rounded-full bg-[#9B7FBB]/20" />
        <div className="absolute right-[35%] top-[38%] h-[3px] w-[3px] rounded-full bg-[#9B7FBB]/25" />
        <div className="absolute left-[65%] top-[50%] h-[6px] w-[6px] rounded-full bg-[#C9A88D]/20" />
        <div className="absolute right-[18%] top-[65%] h-[4px] w-[4px] rounded-full bg-[#9B7FBB]/20" />
        <div className="absolute left-[8%] top-[60%] h-[3px] w-[3px] rounded-full bg-[#C9A88D]/25" />
        <div className="absolute right-[45%] bottom-[25%] h-[5px] w-[5px] rounded-full bg-[#9B7FBB]/20" />
        <div className="absolute left-[35%] bottom-[30%] h-[3px] w-[3px] rounded-full bg-[#9B7FBB]/25" />
        <div className="absolute right-[5%] bottom-[40%] h-[4px] w-[4px] rounded-full bg-[#C9A88D]/20" />
        <div className="absolute left-[70%] bottom-[10%] h-[5px] w-[5px] rounded-full bg-[#9B7FBB]/18" />

        {/* Floating particles */}
        <div className="absolute left-[12%] top-[35%] h-[2px] w-[2px] rounded-full bg-[#9B7FBB]/35" />
        <div className="absolute right-[30%] top-[15%] h-[2px] w-[2px] rounded-full bg-[#C9A88D]/30" />
        <div className="absolute left-[70%] top-[30%] h-[2px] w-[2px] rounded-full bg-[#9B7FBB]/30" />
        <div className="absolute left-[25%] top-[55%] h-[2px] w-[2px] rounded-full bg-[#C9A88D]/25" />
        <div className="absolute right-[15%] top-[40%] h-[2px] w-[2px] rounded-full bg-[#9B7FBB]/30" />
        <div className="absolute left-[45%] top-[70%] h-[2px] w-[2px] rounded-full bg-[#9B7FBB]/25" />
        <div className="absolute right-[55%] bottom-[15%] h-[2px] w-[2px] rounded-full bg-[#C9A88D]/25" />
        <div className="absolute right-[8%] bottom-[8%] h-[2px] w-[2px] rounded-full bg-[#9B7FBB]/30" />
        <div className="absolute left-[5%] bottom-[5%] h-[2px] w-[2px] rounded-full bg-[#C9A88D]/25" />
        <div className="absolute right-[40%] top-[5%] h-[2px] w-[2px] rounded-full bg-[#9B7FBB]/30" />
        <div className="absolute left-[60%] bottom-[40%] h-[2px] w-[2px] rounded-full bg-[#9B7FBB]/25" />
        <div className="absolute right-[10%] bottom-[50%] h-[2px] w-[2px] rounded-full bg-[#C9A88D]/25" />
      </div>

      {/* Thin intertwined light threads — arc across behind the login card */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        <style>{`
          @keyframes flowA {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -360; }
          }
          @keyframes flowB {
            0% { stroke-dashoffset: 360; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes flowC {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -300; }
          }
          @keyframes flowD {
            0% { stroke-dashoffset: 300; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes flowE {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -100; }
          }
          .flow-a { animation: flowA 1.8s linear infinite; }
          .flow-b { animation: flowB 2.2s linear infinite; }
          .flow-c { animation: flowC 3s linear infinite; }
          .flow-d { animation: flowD 3.5s linear infinite; }
          .flow-e { animation: flowE 2.5s linear infinite; }
        `}</style>
        <svg className="absolute left-[-8%] top-1/2 h-24 w-[116%] -translate-y-8" viewBox="0 0 1000 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="threadA" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F7C8E0" stopOpacity="0" />
              <stop offset="15%" stopColor="#F7C8E0" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#BFA8E8" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#BFA8E8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F7C8E0" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="threadB" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C9A88D" stopOpacity="0" />
              <stop offset="20%" stopColor="#C9A88D" stopOpacity="0.3" />
              <stop offset="45%" stopColor="#9B7FBB" stopOpacity="0.4" />
              <stop offset="65%" stopColor="#BFA8E8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C9A88D" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="glowA" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFF8FC" stopOpacity="0" />
              <stop offset="15%" stopColor="#FFF8FC" stopOpacity="0" />
              <stop offset="25%" stopColor="#FFF8FC" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FFF8FC" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#FFF8FC" stopOpacity="0" />
              <stop offset="100%" stopColor="#FFF8FC" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="glowB" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFF8FC" stopOpacity="0" />
              <stop offset="20%" stopColor="#FFF8FC" stopOpacity="0" />
              <stop offset="30%" stopColor="#FFF8FC" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#FFF8FC" stopOpacity="0.7" />
              <stop offset="65%" stopColor="#FFF8FC" stopOpacity="0" />
              <stop offset="100%" stopColor="#FFF8FC" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Thread A — pink, arcs up then down */}
          <path d="M0 50 Q120 20 250 55 T500 25 T750 55 T1000 40" stroke="url(#threadA)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M0 50 Q120 20 250 55 T500 25 T750 55 T1000 40" stroke="url(#glowA)" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeDasharray="140 220" className="flow-a" opacity="0.85" />
          {/* Thread B — purple, arcs down then up (intertwined) */}
          <path d="M0 35 Q120 65 250 30 T500 60 T750 30 T1000 45" stroke="url(#threadB)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M0 35 Q120 65 250 30 T500 60 T750 30 T1000 45" stroke="url(#glowB)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeDasharray="100 260" className="flow-b" opacity="0.75" />
        </svg>
      </div>

      {/* Login form area */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-12">
        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-3">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F7C8E0" />
                    <stop offset="100%" stopColor="#BFA8E8" />
                  </linearGradient>
                  <linearGradient id="threadGrad1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFF8FC" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FFF8FC" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="threadGrad2" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FFF8FC" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#FFF8FC" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                <path d="M46 14 C54 14 56 22 56 32 C56 42 54 50 46 50" stroke="url(#logoGrad)" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.3" />
                <path d="M32 12 C38 12 42 16 44 22 C46 28 50 30 50 32 C50 34 46 36 44 42 C42 48 38 52 32 52 C26 52 22 48 20 42 C18 36 14 34 14 32 C14 30 18 28 20 22 C22 16 26 12 32 12Z" fill="url(#logoGrad)" opacity="0.92" />
                <path d="M32 18 C36 18 39 21 40 25 C41 29 44 31 44 32 C44 33 41 35 40 39 C39 43 36 46 32 46 C28 46 25 43 24 39 C23 35 20 33 20 32 C20 31 23 29 24 25 C25 21 28 18 32 18Z" fill="#FFF8FC" opacity="0.15" />
                <path d="M26 28 C30 24 34 30 38 26" stroke="url(#threadGrad1)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                <path d="M26 32 C30 36 34 31 38 36" stroke="url(#threadGrad2)" strokeWidth="1" fill="none" strokeLinecap="round" />
                <circle cx="28" cy="22" r="1.5" fill="#FFF8FC" opacity="0.4" />
                <circle cx="38" cy="40" r="1" fill="#FFF8FC" opacity="0.3" />
              </svg>
              <div className="text-left">
                <div className="text-xl font-light tracking-[0.12em] text-[#1F1D2B]">星隅</div>
                <p className="text-[9px] tracking-[0.25em] text-[#BFA8E8]/60 uppercase">XingYu</p>
              </div>
            </div>
          </div>

          <p className="mb-6 text-center text-xs leading-relaxed text-[#8A8696] tracking-wider">
            世间人人皆是独一无二的星辰<br />30秒照见独一无二的你
          </p>

          <div className="mb-6 flex items-center justify-center gap-2 text-xs text-[#8A8696]">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#9B7FBB]/20" />
            <span className="tracking-[0.08em]">个人人格报告</span>
            <span className="text-[#B8B6C0]">·</span>
            <span className="tracking-[0.08em]">双人对比报告</span>
            <span className="h-px w-8 bg-gradient-to-r from-[#9B7FBB]/20 to-transparent" />
          </div>

          <div className="rounded-[16px] bg-[#FFFFFF] p-6 shadow-[0_2px_20px_rgba(155,127,187,0.08)]">
            <h2 className="mb-1 text-center text-base font-medium text-[#1F1D2B]">欢迎回来</h2>
            <p className="mb-5 text-center text-xs leading-relaxed text-[#6B6778]">
              登录后可永久保存您的专属报告
            </p>

            {error && (
              <div className="mb-4 rounded-[8px] bg-[#FDE8E8] px-3 py-2 text-xs text-[#C0392B]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="用户名"
                className="w-full rounded-[8px] border border-[rgba(0,0,0,0.08)] bg-[#F8F8FA] px-3 py-2.5 text-sm text-[#1F1D2B] outline-none transition-all placeholder:text-[#8A8696]/50 focus:border-[#9B7FBB] focus:bg-[#FFFFFF] focus:shadow-[0_0_0_3px_rgba(155,127,187,0.1)]"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                className="w-full rounded-[8px] border border-[rgba(0,0,0,0.08)] bg-[#F8F8FA] px-3 py-2.5 text-sm text-[#1F1D2B] outline-none transition-all placeholder:text-[#8A8696]/50 focus:border-[#9B7FBB] focus:bg-[#FFFFFF] focus:shadow-[0_0_0_3px_rgba(155,127,187,0.1)]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[8px] bg-[#9B7FBB] py-2.5 text-sm font-medium text-[#FFFFFF] transition-all hover:bg-[#8A6EAA] hover:shadow-[0_2px_12px_rgba(155,127,187,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:hover:shadow-none disabled:active:scale-100"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-[#8A8696]">
              没有账号？请联系管理员创建<br />
              <Link href="/admin" className="text-[#9B7FBB] transition-colors hover:text-[#8A6EAA]">管理员登录 →</Link>
            </p>

            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-xs text-[#9B7FBB] transition-colors hover:text-[#8A6EAA]"
              >
                以游客身份继续浏览 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 pb-6 pt-2 text-center">
        <div className="mx-auto flex items-center justify-center gap-4 text-[11px] text-[#8A8696]/50">
          <Link href="/privacy" className="transition-colors hover:text-[#8A8696]">隐私政策</Link>
          <span className="text-[#8A8696]/20">|</span>
          <Link href="/terms" className="transition-colors hover:text-[#8A8696]">服务条款</Link>
          <span className="text-[#8A8696]/20">|</span>
          <Link href="/disclaimer" className="transition-colors hover:text-[#8A8696]">免责声明</Link>
        </div>
      </div>
    </div>
  );
}
