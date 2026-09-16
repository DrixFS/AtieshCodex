import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnApplicationShutdown, OnModuleDestroy, Optional } from '@nestjs/common';
import { CorrelationContextService } from '../logger';
import { JOB_NAMES, QUEUES } from './queue.constants';

export interface SystemJobPayload {
  triggeredBy?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

export interface SystemJobResult {
  status: 'completed' | 'healthy' | 'ignored';
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface SystemJobLike {
  id?: string;
  name: string;
  data: SystemJobPayload;
}

@Processor(QUEUES.SYSTEM)
export class SystemQueueProcessor
  extends WorkerHost
  implements OnModuleDestroy, OnApplicationShutdown
{
  private readonly logger = new Logger(SystemQueueProcessor.name);

  constructor(
    @Optional()
    private readonly correlationContext?: CorrelationContextService,
  ) {
    super();
  }

  async onModuleDestroy(): Promise<void> {
    await this.closeWorker();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.closeWorker();
  }

  private async closeWorker(): Promise<void> {
    try {
      if (this.worker) {
        await this.worker.close();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Error closing system queue worker: ${message}`);
    }
  }

  @OnWorkerEvent('error')
  onError(error: Error): void {
    this.logger.warn(`System queue worker connection warning: ${error.message}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: SystemJobLike | undefined, error: Error): void {
    const correlationId = job?.data?.correlationId;
    this.logger.error(
      `[${correlationId ?? 'no-corr-id'}] System job ${job?.id ?? 'unknown'} failed: ${error.message}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: SystemJobLike): void {
    const correlationId = job.data?.correlationId;
    this.logger.debug(
      `[${correlationId ?? 'no-corr-id'}] System job ${job.id ?? 'unknown'} completed successfully`,
    );
  }

  async process(job: SystemJobLike): Promise<SystemJobResult> {
    const correlationId = job.data.correlationId;

    const executeJob = (): SystemJobResult => {
      this.logger.debug(
        `[${correlationId ?? 'no-corr-id'}] Processing system job "${job.name}" [ID: ${job.id}]`,
      );

      const timestamp = new Date().toISOString();

      switch (job.name) {
        case JOB_NAMES.CLEANUP:
          this.logger.log(
            `[${correlationId ?? 'no-corr-id'}] Executed system cleanup job [ID: ${job.id}]`,
          );
          return {
            status: 'completed',
            timestamp,
            details: { triggeredBy: job.data.triggeredBy ?? 'scheduler' },
          };

        case JOB_NAMES.HEALTH_CHECK:
          this.logger.debug(
            `[${correlationId ?? 'no-corr-id'}] Executed queue health check job [ID: ${job.id}]`,
          );
          return {
            status: 'healthy',
            timestamp,
          };

        default:
          this.logger.warn(
            `[${correlationId ?? 'no-corr-id'}] Received unrecognized system job: ${job.name}`,
          );
          return {
            status: 'ignored',
            timestamp,
          };
      }
    };

    if (correlationId && this.correlationContext) {
      return this.correlationContext.runWith(correlationId, executeJob);
    }

    return executeJob();
  }
}
