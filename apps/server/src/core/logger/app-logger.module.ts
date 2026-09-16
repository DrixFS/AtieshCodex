import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';
import { CorrelationContextService } from './correlation-context.service';
import { CorrelationMiddleware } from './correlation.middleware';
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from './logger.constants';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, CorrelationContextService],
      useFactory: (configService: ConfigService, correlationContext: CorrelationContextService) => {
        const isProduction = configService.get<string>('nodeEnv') === 'production';
        return {
          pinoHttp: {
            genReqId: (req: IncomingMessage, res: ServerResponse) => {
              const headerVal =
                req.headers[CORRELATION_ID_HEADER] ?? req.headers[REQUEST_ID_HEADER];
              const id =
                (typeof headerVal === 'string'
                  ? headerVal
                  : Array.isArray(headerVal)
                    ? headerVal[0]
                    : undefined) ||
                correlationContext.getCorrelationId() ||
                randomUUID();
              res.setHeader(CORRELATION_ID_HEADER, id);
              return id;
            },
            customProps: (req: IncomingMessage) => {
              const correlationId =
                correlationContext.getCorrelationId() ??
                (typeof req.headers[CORRELATION_ID_HEADER] === 'string'
                  ? req.headers[CORRELATION_ID_HEADER]
                  : undefined);
              return {
                correlationId,
              };
            },
            redact: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.headers["set-cookie"]',
              'body.password',
              'body.token',
              'body.secret',
            ],
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                },
          },
        };
      },
    }),
  ],
  providers: [CorrelationContextService, CorrelationMiddleware],
  exports: [CorrelationContextService, CorrelationMiddleware, PinoLoggerModule],
})
export class AppLoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
