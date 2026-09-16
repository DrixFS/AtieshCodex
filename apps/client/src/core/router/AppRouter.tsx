import React from 'react';
import { RouterProvider, type createBrowserRouter } from 'react-router-dom';
import { createAppRouter } from './router';

/**
 * Props for the `AppRouter` component.
 */
export interface AppRouterProps {
  /** Optional custom browser router instance. */
  router?: ReturnType<typeof createBrowserRouter>;
}

/**
 * React component rendering the top-level RouterProvider.
 */
export const AppRouter: React.FC<AppRouterProps> = ({ router }) => {
  const defaultRouter = React.useMemo(() => router ?? createAppRouter(), [router]);
  return <RouterProvider router={defaultRouter} />;
};
