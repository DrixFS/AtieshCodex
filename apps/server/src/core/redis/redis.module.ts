import { Global, Logger, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { RedisConfig } from '../config';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

const redisClientProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Redis => {
    const redisConfig = configService.get<RedisConfig>('app.redis') ?? {
      host: 'localhost',
      port: 6379,
    };

    const isTest = process.env.NODE_ENV === 'test';

    const redisOptions: RedisOptions = {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db ?? 0,
      keyPrefix: redisConfig.keyPrefix,
      tls: redisConfig.tls ? {} : undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: !isTest,
      retryStrategy: isTest
        ? () => null
        : (times: number) => {
            // Exponential backoff up to 2000ms
            return Math.min(times * 100, 2000);
          },
    };

    const client = new Redis(redisOptions);

    client.on('error', (err) => {
      // Prevent unhandled error event crashes when Redis is temporarily unavailable
      const logger = new Logger('RedisClient');
      logger.warn(`Redis connection event warning: ${err.message}`);
    });

    return client;
  },
};

@Global()
@Module({
  providers: [redisClientProvider, RedisService],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
