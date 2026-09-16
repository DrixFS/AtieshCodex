import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, Optional } from '@nestjs/common';
import { Job, JobsOptions, Queue } from 'bullmq';
import { CorrelationContextService } from '../logger';
import { JOB_NAMES, JobName, QUEUES, QueueName } from './queue.constants';
import { SystemJobPayload, SystemJobResult } from './system-queue.processor';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QUEUES.SYSTEM)
    private readonly systemQueue: Queue<SystemJobPayload, SystemJobResult, string>,
    @Optional()
    private readonly correlationContext?: CorrelationContextService,
  ) {
    this.systemQueue.on('error', (err) => {
      this.logger.warn(`System queue connection warning: ${err.message}`);
    });
  }

  getSystemQueue(): Queue<SystemJobPayload, SystemJobResult, string> {
    return this.systemQueue;
  }

  async dispatchSystemJob(
    jobName: JobName,
    payload: SystemJobPayload = {},
    options?: JobsOptions,
  ): Promise<Job<SystemJobPayload, SystemJobResult, string>> {
    const correlationId = payload.correlationId ?? this.correlationContext?.getCorrelationId();
    const finalPayload: SystemJobPayload = {
      ...payload,
      ...(correlationId ? { correlationId } : {}),
    };
    this.logger.debug(
      `[${correlationId ?? 'no-corr-id'}] Dispatching system job "${jobName}" to queue "${QUEUES.SYSTEM}"`,
    );
    return this.systemQueue.add(jobName, finalPayload, options);
  }

  async triggerCleanup(
    triggeredBy = 'manual',
  ): Promise<Job<SystemJobPayload, SystemJobResult, string>> {
    return this.dispatchSystemJob(JOB_NAMES.CLEANUP, { triggeredBy });
  }

  async triggerHealthCheck(): Promise<Job<SystemJobPayload, SystemJobResult, string>> {
    return this.dispatchSystemJob(JOB_NAMES.HEALTH_CHECK, {});
  }

  async isQueueHealthy(queueName: QueueName = QUEUES.SYSTEM): Promise<boolean> {
    try {
      if (queueName === QUEUES.SYSTEM) {
        const isPaused = await this.systemQueue.isPaused();
        return !isPaused;
      }
      return true;
    } catch (error) {
      this.logger.error(`Failed to check queue health for ${queueName}:`, error);
      return false;
    }
  }
}
