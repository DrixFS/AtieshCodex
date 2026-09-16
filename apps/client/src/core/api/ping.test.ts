import type { PingResponse } from '@atiesh/contracts';
import { pingApi, ApiClient } from './index';

describe('pingApi', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls /ping and returns PingResponse payload', async () => {
    const mockResponse: PingResponse = {
      message: 'pong',
      timestamp: '2026-09-15T12:00:00.000Z',
    };

    jest.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const result = await pingApi.ping();

    expect(fetch).toHaveBeenCalledWith(
      '/api/ping',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      }),
    );
    expect(result).toEqual(mockResponse);
  });

  it('supports custom ApiClient instance', async () => {
    const customClient = new ApiClient('http://custom-host/api');
    const mockResponse: PingResponse = {
      message: 'pong',
      timestamp: '2026-09-15T12:00:00.000Z',
    };

    jest.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const result = await pingApi.ping(customClient);

    expect(fetch).toHaveBeenCalledWith(
      'http://custom-host/api/ping',
      expect.objectContaining({
        method: 'GET',
      }),
    );
    expect(result).toEqual(mockResponse);
  });
});
