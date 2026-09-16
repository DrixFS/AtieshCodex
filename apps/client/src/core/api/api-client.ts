import { config } from '../config';
import { ApiClientError } from './errors';
import type { ApiErrorResponse, HttpMethod, QueryParams, RequestOptions } from './types';

function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return typeof data === 'object' && data !== null && 'message' in data;
}

function extractErrorMessage(errorData: unknown, fallback: string): string {
  if (isApiErrorResponse(errorData)) {
    const { message } = errorData;
    if (Array.isArray(message)) {
      return message.filter((item): item is string => typeof item === 'string').join(', ');
    }
    if (typeof message === 'string') {
      return message;
    }
    if (message !== undefined && message !== null) {
      return String(message);
    }
  }
  return fallback;
}

function extractCorrelationId(errorData: unknown, responseHeaders: Headers): string | undefined {
  if (isApiErrorResponse(errorData) && typeof errorData.correlationId === 'string') {
    return errorData.correlationId;
  }
  const header = responseHeaders.get('x-correlation-id') ?? responseHeaders.get('x-request-id');
  return header ?? undefined;
}

function normalizeHeaders(
  defaultHeaders: HeadersInit,
  customHeaders?: HeadersInit,
): Record<string, string> {
  const result: Record<string, string> = {};

  const addHeader = (key: string, value: string): void => {
    result[key] = value;
  };

  const appendFromInit = (init: HeadersInit): void => {
    if (init instanceof Headers) {
      init.forEach((val, key) => addHeader(key, val));
    } else if (Array.isArray(init)) {
      for (const [k, v] of init) {
        addHeader(k, v);
      }
    } else if (typeof init === 'object' && init !== null) {
      for (const [k, v] of Object.entries(init)) {
        if (typeof v === 'string') {
          addHeader(k, v);
        }
      }
    }
  };

  appendFromInit(defaultHeaders);
  if (customHeaders) {
    appendFromInit(customHeaders);
  }

  if (!result['Accept']) {
    result['Accept'] = 'application/json';
  }

  return result;
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return response.json().catch(() => undefined);
  }
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text().then((text) => response.json().catch(() => text));
}

/**
 * Core HTTP client for interacting with the backend API.
 * Features automated JSON serialization, correlation ID propagation, query parameter building,
 * and strongly typed error transformations.
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: HeadersInit;

  /**
   * Initializes a new instance of `ApiClient`.
   *
   * @param baseUrl - Base URL for API requests. Defaults to `config.apiBaseUrl`.
   * @param defaultHeaders - Default HTTP headers applied to all requests.
   */
  constructor(baseUrl: string = config.apiBaseUrl, defaultHeaders: HeadersInit = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.defaultHeaders = defaultHeaders;
  }

  private buildUrl(path: string, params?: QueryParams): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const base = this.baseUrl ? `${this.baseUrl}${cleanPath}` : cleanPath;

    if (!params) {
      return base;
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          searchParams.append(key, String(item));
        }
      } else {
        searchParams.append(key, String(value));
      }
    }

    const queryString = searchParams.toString();
    if (!queryString) {
      return base;
    }

    return `${base}${base.includes('?') ? '&' : '?'}${queryString}`;
  }

  /**
   * Executes an HTTP request with automatic error parsing and correlation tracking.
   *
   * @typeParam T - Expected response payload type.
   * @param path - Target API endpoint path (e.g. `/ping` or `users`).
   * @param method - HTTP verb (GET, POST, PUT, PATCH, DELETE).
   * @param options - Additional request configuration, query parameters, headers, or body.
   * @returns Resolves with the parsed response payload.
   * @throws `ApiClientError` on non-2xx responses or network failures.
   */
  async request<T>(
    path: string,
    method: HttpMethod = 'GET',
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, headers: customHeaders, body, correlationId, ...customOptions } = options;
    const url = this.buildUrl(path, params);

    const headers = normalizeHeaders(this.defaultHeaders, customHeaders);

    const effectiveCorrelationId =
      correlationId ??
      headers['x-correlation-id'] ??
      headers['x-request-id'] ??
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : undefined);

    if (effectiveCorrelationId && !headers['x-correlation-id']) {
      headers['x-correlation-id'] = effectiveCorrelationId;
    }

    let requestBody: BodyInit | undefined = undefined;
    if (typeof body === 'string') {
      requestBody = body;
    } else if (
      body instanceof Blob ||
      body instanceof FormData ||
      body instanceof URLSearchParams
    ) {
      requestBody = body;
    } else if (body !== undefined && body !== null) {
      requestBody = JSON.stringify(body);
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: requestBody,
      ...customOptions,
    });

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        try {
          errorData = await response.text();
        } catch {
          errorData = null;
        }
      }

      const errorMessage = extractErrorMessage(
        errorData,
        `HTTP error ${response.status}: ${response.statusText}`,
      );

      const returnedCorrelationId =
        extractCorrelationId(errorData, response.headers) ?? effectiveCorrelationId;

      throw new ApiClientError(
        errorMessage,
        response.status,
        response.statusText,
        errorData,
        url,
        returnedCorrelationId,
      );
    }

    return await parseResponseBody<T>(response);
  }

  /**
   * Performs an HTTP GET request.
   *
   * @typeParam T - Expected response payload type.
   * @param path - Target API endpoint path.
   * @param options - Optional request options and query parameters.
   */
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, 'GET', options);
  }

  /**
   * Performs an HTTP POST request.
   *
   * @typeParam T - Expected response payload type.
   * @param path - Target API endpoint path.
   * @param body - Request body payload to serialize.
   * @param options - Optional request configuration.
   */
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, 'POST', { ...options, body });
  }

  /**
   * Performs an HTTP PUT request.
   *
   * @typeParam T - Expected response payload type.
   * @param path - Target API endpoint path.
   * @param body - Request body payload to serialize.
   * @param options - Optional request configuration.
   */
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, 'PUT', { ...options, body });
  }

  /**
   * Performs an HTTP PATCH request.
   *
   * @typeParam T - Expected response payload type.
   * @param path - Target API endpoint path.
   * @param body - Request body payload to serialize.
   * @param options - Optional request configuration.
   */
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, 'PATCH', { ...options, body });
  }

  /**
   * Performs an HTTP DELETE request.
   *
   * @typeParam T - Expected response payload type.
   * @param path - Target API endpoint path.
   * @param options - Optional request configuration.
   */
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, 'DELETE', options);
  }
}

/**
 * Default singleton instance of `ApiClient` configured with the base application URL.
 */
export const apiClient = new ApiClient();
