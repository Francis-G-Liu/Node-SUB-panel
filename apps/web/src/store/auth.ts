import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'super_admin' | 'ops' | 'support' | 'auditor' | 'user';

interface AuthState {
  accessToken: string;
  email: string;
  nickname: string;
  userRole: UserRole | null;
  login: (token: string, email?: string, nickname?: string, role?: UserRole) => void;
  logout: () => void;
}

const defaultAccessToken = '';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: defaultAccessToken,
      email: '',
      nickname: '',
      userRole: null,
      login: (token: string, email?: string, nickname?: string, role?: UserRole) =>
        set({ 
          accessToken: token, 
          email: email ?? '', 
          nickname: nickname ?? '', 
          userRole: role ?? null 
        }),
      logout: () =>
        set({ 
          accessToken: '', 
          email: '', 
          nickname: '', 
          userRole: null 
        }),
    }),
    {
      name: 'nodeadmin-auth-storage',
    }
  )
);
