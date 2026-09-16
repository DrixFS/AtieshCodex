import { env } from './env';

export * from './env';

/**
 * Typed client application configuration structure.
 */
export interface AppConfig {
  /** Base URL for API requests. Defaults to `/api` or `VITE_API_BASE_URL`. */
  apiBaseUrl: string;
  /** Human-readable application title. */
  appName: string;
  /** Current runtime environment name (e.g. `development`, `production`, `test`). */
  env: string;
  /** Whether the application is running in Vite development mode. */
  isDev: boolean;
  /** Whether the application is running in production mode. */
  isProd: boolean;
}

/**
 * Global client application configuration singleton loaded from validated Vite environment variables.
 */
export const config: AppConfig = {
  apiBaseUrl: env.VITE_API_BASE_URL,
  appName: 'Atiesh Codex',
  env: env.MODE,
  isDev: env.DEV,
  isProd: env.PROD,
};
