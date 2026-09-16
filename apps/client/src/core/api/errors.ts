/**
 * Custom error class representing HTTP and network failures during ApiClient requests.
 * Encapsulates status code, response payload, target URL, and correlation ID for tracing.
 */
export class ApiClientError extends Error {
  /** HTTP response status code (e.g. 400, 401, 500) or 0 on network abort. */
  readonly status: number;
  /** Status text returned by HTTP response. */
  readonly statusText: string;
  /** Response payload parsed from the server. */
  readonly data: unknown;
  /** Request URL that resulted in the error. */
  readonly url: string;
  /** Optional correlation ID extracted from response headers or body for tracing. */
  readonly correlationId?: string;

  /**
   * Constructs an instance of `ApiClientError`.
   *
   * @param message - Human-readable error message.
   * @param status - HTTP status code.
   * @param statusText - HTTP status text.
   * @param data - Parsed response payload.
   * @param url - Request URL that triggered the error.
   * @param correlationId - Optional correlation ID for tracing.
   */
  constructor(
    message: string,
    status: number,
    statusText: string,
    data: unknown,
    url: string,
    correlationId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.url = url;
    this.correlationId = correlationId;
  }
}
