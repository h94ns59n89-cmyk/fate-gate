import { create } from 'zustand';
import type { UserProfile } from '@/lib/types';

interface UserState {
  token: string | null;
  user: UserProfile | null;
  userId: number | null;
  isGuest: boolean;
  isLoading: boolean;
  isLogin: () => boolean;
  initGuest: () => Promise<number>;
  login: (code: string, invite?: string) => Promise<void>;
  loginWithPassword: (token: string, userId: number, user: UserProfile) => void;
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

function loadIsGuest(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const v = localStorage.getItem('is_guest');
    if (v !== null) return v === 'true';
    // No is_guest flag → migration from old code
    // With token → pre-migration user (guest or logged-in, can't tell, assume logged-in)
    // Without token → fresh visitor
    return !localStorage.getItem('token');
  } catch {
    return true;
  }
}

function loadToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

let guestPromise: Promise<number> | null = null;

export const useUserStore = create<UserState>((set, get) => ({
  token: loadToken(),
  user: null,
  userId: loadUserId(),
  isGuest: loadIsGuest(),
  isLoading: false,

  isLogin: () => !!get().token,

  initGuest: async () => {
    const existing = get().userId;
    const existingToken = get().token;
    if (existing && existingToken) return existing;

    if (guestPromise) return guestPromise;

    set({ isLoading: true });
    guestPromise = (async () => {
      try {
        const response = await fetch('/api/v1/users/guest', { method: 'POST' });
        const data = await response.json();
        if (data.code === 0 && data.data) {
          const uid = data.data.user_id;
          const token = data.data.token;
          set({ userId: uid, token, user: data.data, isGuest: true, isLoading: false });
          localStorage.setItem('token', token);
          localStorage.setItem('user_id', String(uid));
          localStorage.setItem('is_guest', 'true');
          return uid;
        }
        throw new Error(data.message ?? '创建游客用户失败');
      } catch (error) {
        set({ isLoading: false });
        throw error;
      } finally {
        guestPromise = null;
      }
    })();
    return guestPromise;
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
        set({ token: data.data.token, user: data.data.user, userId: uid, isGuest: false, isLoading: false });
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user_id', String(uid));
        localStorage.removeItem('is_guest');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithPassword: (token: string, userId: number, user: UserProfile) => {
    set({ token, userId, user, isGuest: false, isLoading: false });
    localStorage.setItem('token', token);
    localStorage.setItem('user_id', String(userId));
    localStorage.removeItem('is_guest');
  },

  logout: () => {
    set({ token: null, user: null, userId: null, isGuest: false });
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_guest');
  },

  setUser: (user: UserProfile) => set({ user }),
}));
