import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CorrelationContextService } from './correlation-context.service';
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from './logger.constants';

export interface RequestWithHeaders {
  headers: Record<string, string | string[] | undefined>;
}

export interface ResponseWithSetHeader {
  setHeader(name: string, value: string): void;
}

@Injectable()
export class CorrelationMiddleware implements NestMiddleware<
  RequestWithHeaders,
  ResponseWithSetHeader
> {
  constructor(private readonly correlationContext: CorrelationContextService) {}

  use(req: RequestWithHeaders, res: ResponseWithSetHeader, next: () => void): void {
    const rawHeader = req.headers[CORRELATION_ID_HEADER] ?? req.headers[REQUEST_ID_HEADER];
    const correlationId =
      (typeof rawHeader === 'string'
        ? rawHeader
        : Array.isArray(rawHeader)
          ? rawHeader[0]
          : undefined) || randomUUID();

    req.headers[CORRELATION_ID_HEADER] = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    this.correlationContext.runWith(correlationId, () => {
      next();
    });
  }
}
