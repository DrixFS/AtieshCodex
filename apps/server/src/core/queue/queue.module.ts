import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueConfig, RedisConfig } from '../config';
import { QUEUES } from './queue.constants';
import { QueueService } from './queue.service';
import { SystemQueueProcessor } from './system-queue.processor';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get<RedisConfig>('app.redis') ?? {
          host: 'localhost',
          port: 6379,
        };
        const queueConfig = configService.get<QueueConfig>('app.queue') ?? {
          prefix: 'atiesh_codex_queue',
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: 100,
            removeOnFail: 500,
          },
        };

        const isTest = process.env.NODE_ENV === 'test';

        return {
          prefix: queueConfig.prefix,
          connection: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.db ?? 0,
            tls: redisConfig.tls ? {} : undefined,
            keyPrefix: redisConfig.keyPrefix ? `${redisConfig.keyPrefix}bull:` : undefined,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            lazyConnect: true,
            enableOfflineQueue: !isTest,
            retryStrategy: isTest ? () => null : (times: number) => Math.min(times * 100, 2000),
          },
          defaultJobOptions: queueConfig.defaultJobOptions,
        };
      },
    }),
    BullModule.registerQueue({
      name: QUEUES.SYSTEM,
    }),
  ],
  providers: [QueueService, SystemQueueProcessor],
  exports: [BullModule, QueueService],
})
export class QueueModule {}
