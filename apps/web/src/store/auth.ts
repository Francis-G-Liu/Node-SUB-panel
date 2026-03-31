import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export type UserRole = 'super_admin' | 'ops' | 'support' | 'auditor' | 'user';

interface AuthState {
  adminToken: string;
  userToken: string;
  adminEmail: string;
  adminName: string;
  userRole: UserRole | null;
  rotateTokens: () => void;
  loginAdmin: (token: string, email?: string, name?: string, role?: UserRole) => void;
  logout: () => void;
}

const defaultAdminToken = '';
const defaultUserToken = '';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      adminToken: defaultAdminToken,
      userToken: defaultUserToken,
      adminEmail: '',
      adminName: '',
      userRole: null,
      rotateTokens: () =>
        set(() => ({
          adminToken: `${defaultAdminToken}-${nanoid(6)}`,
          userToken: `${defaultUserToken}-${nanoid(6)}`,
        })),
      loginAdmin: (token: string, email?: string, name?: string, role?: UserRole) =>
        set({ adminToken: token, adminEmail: email ?? '', adminName: name ?? '', userRole: role ?? null }),
      logout: () =>
        set({ adminToken: '', adminEmail: '', adminName: '', userRole: null }),
    }),
    {
      name: 'nodeadmin-auth-storage',
    }
  )
);
