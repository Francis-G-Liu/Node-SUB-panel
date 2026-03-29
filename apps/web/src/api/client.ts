import { useMemo } from 'react';
import { AdminApi, AppApi } from '@airport/sdk';
import { useAuthStore } from '../store/auth';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const useAdminApi = () => {
  const adminToken = useAuthStore((state) => state.adminToken);
  return useMemo(() => new AdminApi({ baseUrl, tokenProvider: adminToken }), [adminToken]);
};

export const useAppApi = () => {
  const userToken = useAuthStore((state) => state.userToken);
  return useMemo(() => new AppApi({ baseUrl, tokenProvider: userToken }), [userToken]);
};
