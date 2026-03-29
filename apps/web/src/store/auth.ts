import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

interface AuthState {
  adminToken: string;
  userToken: string;
  adminEmail: string;
  adminName: string;
  rotateTokens: () => void;
  loginAdmin: (token: string, email?: string, name?: string) => void;
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
      rotateTokens: () =>
        set(() => ({
          adminToken: `${defaultAdminToken}-${nanoid(6)}`,
          userToken: `${defaultUserToken}-${nanoid(6)}`,
        })),
      loginAdmin: (token: string, email?: string, name?: string) => 
        set({ adminToken: token, adminEmail: email ?? '', adminName: name ?? '' }),
      logout: () => 
        set({ adminToken: '', adminEmail: '', adminName: '' }),
    }),
    {
      name: 'nodeadmin-auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
