import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { MainLayout } from '../layout/MainLayout';
import { LandingPage } from '../LandingPage';
import { ROUTES } from './routes';

/**
 * Route hierarchy definitions for the React SPA.
 */
export const appRoutes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },
];

/**
 * Creates a browser router instance from the configured route definitions.
 *
 * @param routes - Optional custom route objects (useful for testing navigation).
 * @returns Configured browser router.
 */
export const createAppRouter = (routes: RouteObject[] = appRoutes) => {
  return createBrowserRouter(routes);
};
