import { QueryClient } from '@tanstack/react-query';
import { notifyError } from '../utils/notifyUtil';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 0,
      onError: (error: any) => {
        const message =
          error?.response?.data?.message || error?.message || 'Operation failed';
        notifyError(message);
      },
    },
  },
});
