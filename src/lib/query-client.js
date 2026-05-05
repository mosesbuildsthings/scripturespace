import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,       // 30s default — reduces redundant fetches
      gcTime: 5 * 60_000,      // 5 min cache
    },
    mutations: {
      retry: 0,
    },
  },
});