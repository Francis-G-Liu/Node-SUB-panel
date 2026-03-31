import { useMemo } from 'react';
import { AdminApi, AppApi } from '@airport/sdk';
import { useAuthStore } from '../store/auth';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const useAdminApi = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMemo(() => new AdminApi({ baseUrl, tokenProvider: accessToken }), [accessToken]);
};

export const useAppApi = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMemo(() => new AppApi({ baseUrl, tokenProvider: accessToken }), [accessToken]);
};
