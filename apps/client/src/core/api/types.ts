/**
 * Supported HTTP methods for ApiClient requests.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Key-value mapping representing URL query parameters.
 */
export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined | Array<string | number | boolean>
>;

/**
 * Configuration options for outgoing HTTP requests via ApiClient.
 */
export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  /** Optional query parameters appended to the URL. */
  params?: QueryParams;
  /** Optional custom HTTP headers. */
  headers?: HeadersInit;
  /** Optional JSON payload or serializable body. */
  body?: unknown;
  /** Optional correlation ID for distributed request tracing. */
  correlationId?: string;
}

/**
 * Standardized structure for error responses returned by the NestJS backend.
 */
export interface ApiErrorResponse {
  /** HTTP status code of the error response. */
  statusCode?: number;
  /** Error message or array of validation error messages. */
  message?: string | string[];
  /** Error category name (e.g. `Bad Request`, `Internal Server Error`). */
  error?: string;
  /** Unique correlation ID associated with the request context. */
  correlationId?: string;
  /** Request path where the error occurred. */
  path?: string;
  /** ISO timestamp when the error occurred. */
  timestamp?: string;
  [key: string]: unknown;
}
