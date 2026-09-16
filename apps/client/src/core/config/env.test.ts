import { validateClientEnv } from './env';

describe('validateClientEnv', () => {
  it('should parse valid environment variables', () => {
    const raw = {
      VITE_API_BASE_URL: 'http://localhost:3001/api',
      MODE: 'production',
      DEV: false,
      PROD: true,
    };

    const parsed = validateClientEnv(raw);
    expect(parsed.VITE_API_BASE_URL).toBe('http://localhost:3001/api');
    expect(parsed.MODE).toBe('production');
    expect(parsed.DEV).toBe(false);
    expect(parsed.PROD).toBe(true);
  });

  it('should apply default values when optional fields are missing', () => {
    const raw = {};

    const parsed = validateClientEnv(raw);
    expect(parsed.VITE_API_BASE_URL).toBe('/api');
    expect(parsed.MODE).toBe('development');
    expect(parsed.DEV).toBe(false);
    expect(parsed.PROD).toBe(false);
  });

  it('should throw an error when VITE_API_BASE_URL is empty string', () => {
    const raw = {
      VITE_API_BASE_URL: '',
    };

    expect(() => validateClientEnv(raw)).toThrow(/Invalid client environment configuration/);
  });
});
