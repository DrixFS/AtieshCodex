import type { PingResponse } from '@atiesh/contracts';
import { apiClient, type ApiClient } from './api-client';

/**
 * API methods for backend health and liveness checks.
 */
export const pingApi = {
  /**
   * Pings the server health endpoint `/ping`.
   *
   * @param client - Optional custom `ApiClient` instance (defaults to shared singleton).
   * @returns Server health status, uptime, timestamp, and correlation ID.
   */
  ping: (client: ApiClient = apiClient): Promise<PingResponse> => client.get<PingResponse>('/ping'),
};
