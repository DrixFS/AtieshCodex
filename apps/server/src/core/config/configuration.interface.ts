export interface SwaggerConfig {
  enabled: boolean;
  path: string;
  title: string;
  description: string;
  version: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  tls?: boolean;
}

export interface QueueDefaultJobOptions {
  attempts: number;
  backoff: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete: boolean | number;
  removeOnFail: boolean | number;
}

export interface QueueConfig {
  prefix: string;
  defaultJobOptions: QueueDefaultJobOptions;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  globalPrefix: string;
  corsOrigin: string;
  appSecret?: string;
  databaseUrl?: string;
  swagger: SwaggerConfig;
  redis: RedisConfig;
  queue: QueueConfig;
}
