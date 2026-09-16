import { appConfiguration } from './configuration';

describe('appConfiguration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default values when environment variables are not set', () => {
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.GLOBAL_PREFIX;
    delete process.env.CORS_ORIGIN;
    delete process.env.SWAGGER_ENABLED;
    delete process.env.SWAGGER_PATH;
    delete process.env.SWAGGER_TITLE;
    delete process.env.SWAGGER_DESCRIPTION;
    delete process.env.SWAGGER_VERSION;

    const config = appConfiguration();

    expect(config.port).toBe(3001);
    expect(config.nodeEnv).toBe('development');
    expect(config.globalPrefix).toBe('api');
    expect(config.corsOrigin).toBe('*');
    expect(config.swagger.enabled).toBe(true);
    expect(config.swagger.path).toBe('api/docs');
    expect(config.swagger.title).toBe('Atiesh Codex API');
    expect(config.swagger.version).toBe('1.0.0');
  });

  it('should respect custom environment variables when provided', () => {
    process.env.PORT = '8080';
    process.env.NODE_ENV = 'production';
    process.env.GLOBAL_PREFIX = 'v1';
    process.env.CORS_ORIGIN = 'https://atieshcodex.com';
    process.env.SWAGGER_ENABLED = 'false';
    process.env.SWAGGER_PATH = 'docs';
    process.env.SWAGGER_TITLE = 'Custom API';
    process.env.SWAGGER_DESCRIPTION = 'Custom Description';
    process.env.SWAGGER_VERSION = '2.0.0';

    const config = appConfiguration();

    expect(config.port).toBe(8080);
    expect(config.nodeEnv).toBe('production');
    expect(config.globalPrefix).toBe('v1');
    expect(config.corsOrigin).toBe('https://atieshcodex.com');
    expect(config.swagger.enabled).toBe(false);
    expect(config.swagger.path).toBe('docs');
    expect(config.swagger.title).toBe('Custom API');
    expect(config.swagger.description).toBe('Custom Description');
    expect(config.swagger.version).toBe('2.0.0');
  });
});
