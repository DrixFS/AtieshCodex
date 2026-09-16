import { Injectable, Optional } from '@nestjs/common';
import { PingResponse } from '../../common';
import { CorrelationContextService } from '../logger';

@Injectable()
export class PingService {
  constructor(
    @Optional()
    private readonly correlationContext?: CorrelationContextService,
  ) {}

  ping(): PingResponse {
    const correlationId = this.correlationContext?.getCorrelationId();
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
      ...(correlationId ? { correlationId } : {}),
    };
  }
}
