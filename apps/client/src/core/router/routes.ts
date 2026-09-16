/**
 * Application route path constants.
 */
export const ROUTES = {
  /** Root landing page route path. */
  HOME: '/',
} as const;

/**
 * Route dictionary type mapping.
 */
export type AppRoutes = typeof ROUTES;
