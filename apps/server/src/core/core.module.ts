import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { appConfiguration } from './config';
import { GlobalHttpExceptionFilter } from './filters';
import { AppLoggerModule } from './logger';
import { PingController } from './ping/ping.controller';
import { PingService } from './ping/ping.service';
import { QueueModule } from './queue';
import { RedisModule } from './redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfiguration],
      envFilePath: ['.env.local', '.env', '../.env.local', '../.env'],
    }),
    AppLoggerModule,
    RedisModule,
    QueueModule,
  ],
  controllers: [PingController],
  providers: [
    PingService,
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
  ],
  exports: [AppLoggerModule, PingService, RedisModule, QueueModule],
})
export class CoreModule {}
