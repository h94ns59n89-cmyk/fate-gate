import { create } from 'zustand';
import type { UserProfile } from '@/lib/types';

interface UserState {
  token: string | null;
  user: UserProfile | null;
  userId: number | null;
  isLoading: boolean;
  isLogin: () => boolean;
  initGuest: () => Promise<number>;
  login: (code: string, invite?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: UserProfile) => void;
}

function loadUserId(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const id = localStorage.getItem('user_id');
    return id ? Number(id) : null;
  } catch {
    return null;
  }
}

export const useUserStore = create<UserState>((set, get) => ({
  token: null,
  user: null,
  userId: loadUserId(),
  isLoading: false,

  isLogin: () => !!get().token,

  initGuest: async () => {
    const existing = get().userId;
    if (existing) return existing;

    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/users/guest', { method: 'POST' });
      const data = await response.json();
      if (data.code === 0 && data.data) {
        const uid = data.data.id;
        set({ userId: uid, user: data.data, isLoading: false });
        localStorage.setItem('user_id', String(uid));
        return uid;
      }
      throw new Error(data.message ?? '创建游客用户失败');
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  login: async (code: string, invite?: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/auth/wechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, invite_code: invite }),
      });
      const data = await response.json();
      if (data.code === 0 && data.data) {
        const uid = data.data.user.id;
        set({ token: data.data.token, user: data.data.user, userId: uid, isLoading: false });
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user_id', String(uid));
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ token: null, user: null, userId: null });
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
  },

  setUser: (user: UserProfile) => set({ user }),
}));
