import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a configured `QueryClient` instance with optimal caching defaults.
 *
 * @returns Configured `QueryClient` instance.
 */
export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

/**
 * Shared singleton `QueryClient` instance used in production runtime.
 */
export const queryClient = createQueryClient();
