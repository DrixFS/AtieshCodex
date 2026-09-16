import { registerAs } from '@nestjs/config';
import { AppConfig } from './configuration.interface';

export const appConfiguration = (): AppConfig => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  globalPrefix: process.env.GLOBAL_PREFIX || 'api',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  appSecret: process.env.APP_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== 'false',
    path: process.env.SWAGGER_PATH || 'api/docs',
    title: process.env.SWAGGER_TITLE || 'Atiesh Codex API',
    description:
      process.env.SWAGGER_DESCRIPTION ||
      'REST and WebSocket API specification for Atiesh Codex services',
    version: process.env.SWAGGER_VERSION || '1.0.0',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'atiesh_codex:',
    tls: process.env.REDIS_TLS === 'true',
  },
  queue: {
    prefix: process.env.QUEUE_PREFIX || 'atiesh_codex_queue',
    defaultJobOptions: {
      attempts: process.env.QUEUE_JOB_ATTEMPTS ? parseInt(process.env.QUEUE_JOB_ATTEMPTS, 10) : 3,
      backoff: {
        type: 'exponential',
        delay: process.env.QUEUE_JOB_BACKOFF_DELAY
          ? parseInt(process.env.QUEUE_JOB_BACKOFF_DELAY, 10)
          : 1000,
      },
      removeOnComplete: process.env.QUEUE_REMOVE_ON_COMPLETE
        ? parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE, 10)
        : 100,
      removeOnFail: process.env.QUEUE_REMOVE_ON_FAIL
        ? parseInt(process.env.QUEUE_REMOVE_ON_FAIL, 10)
        : 500,
    },
  },
});

export default registerAs('app', appConfiguration);
