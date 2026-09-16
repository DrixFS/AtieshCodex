import { ApiClient, ApiClientError } from './index';

describe('ApiClient', () => {
  const baseUrl = 'http://localhost:3001/api';
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient(baseUrl);
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('performs GET request and returns JSON data', async () => {
    const mockData = { status: 'ok', message: 'pong' };
    jest.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const result = await client.get('/ping');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/ping',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      }),
    );
    expect(result).toEqual(mockData);
  });

  it('correctly appends query parameters', async () => {
    jest.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await client.get('/search', {
      params: {
        query: 'paladin',
        page: 1,
        active: true,
        empty: null,
        tags: ['healer', 'dps'],
      },
    });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/search?query=paladin&page=1&active=true&tags=healer&tags=dps',
      expect.anything(),
    );
  });

  it('performs POST request with JSON body', async () => {
    const requestBody = { username: 'arthas' };
    const responseBody = { id: '1', ...requestBody };

    jest.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(responseBody), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const result = await client.post('/users', requestBody);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/users',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify(requestBody),
      }),
    );
    expect(result).toEqual(responseBody);
  });

  it('handles 204 No Content response', async () => {
    jest.mocked(fetch).mockResolvedValueOnce(
      new Response(null, {
        status: 204,
      }),
    );

    const result = await client.delete('/items/1');
    expect(result).toBeUndefined();
  });

  it('throws ApiClientError when response is not ok', async () => {
    const errorBody = { statusCode: 404, message: 'Character not found' };
    jest.mocked(fetch).mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(errorBody), {
          status: 404,
          statusText: 'Not Found',
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );

    await expect(client.get('/characters/999')).rejects.toThrow(ApiClientError);
    await expect(client.get('/characters/999')).rejects.toMatchObject({
      status: 404,
      message: 'Character not found',
      url: 'http://localhost:3001/api/characters/999',
    });
  });

  it('attaches and propagates x-correlation-id header', async () => {
    jest.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await client.get('/health', {
      correlationId: 'custom-client-trace-123',
    });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/health',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-correlation-id': 'custom-client-trace-123',
        }),
      }),
    );
  });

  it('captures correlationId on ApiClientError from error body or response headers', async () => {
    const errorBody = {
      statusCode: 500,
      message: 'Internal server failure',
      correlationId: 'server-err-trace-789',
    };
    jest.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(errorBody), {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          'content-type': 'application/json',
          'x-correlation-id': 'server-err-trace-789',
        },
      }),
    );

    try {
      await client.get('/failing-endpoint');
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError);
      if (error instanceof ApiClientError) {
        expect(error.correlationId).toBe('server-err-trace-789');
        expect(error.status).toBe(500);
      }
    }
  });

  it('supports PUT and PATCH requests', async () => {
    jest.mocked(fetch).mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ updated: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );

    await client.put('/guild/1', { name: 'Knights' });
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/guild/1',
      expect.objectContaining({ method: 'PUT' }),
    );

    await client.patch('/guild/1', { level: 25 });
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/guild/1',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});
