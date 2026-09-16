import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface CorrelationStore {
  correlationId: string;
}

@Injectable()
export class CorrelationContextService {
  private readonly storage = new AsyncLocalStorage<CorrelationStore>();

  public runWith<R>(correlationId: string, callback: () => R): R {
    return this.storage.run({ correlationId }, callback);
  }

  public getCorrelationId(): string | undefined {
    return this.storage.getStore()?.correlationId;
  }
}
