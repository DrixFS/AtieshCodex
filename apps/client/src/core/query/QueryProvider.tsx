import type { FC, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient as defaultQueryClient } from './query-client';

/**
 * Props for the `QueryProvider` component.
 */
export interface QueryProviderProps {
  /** React child node tree to wrap. */
  children: ReactNode;
  /** Optional custom `QueryClient` instance (useful for test isolation). */
  client?: QueryClient;
}

/**
 * Application-wide React Query Provider component delivering asynchronous caching.
 */
export const QueryProvider: FC<QueryProviderProps> = ({
  children,
  client = defaultQueryClient,
}) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
