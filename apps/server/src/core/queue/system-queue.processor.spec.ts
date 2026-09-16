import { Logger } from '@nestjs/common';
import { JOB_NAMES } from './queue.constants';
import { SystemJobLike, SystemQueueProcessor } from './system-queue.processor';

describe('SystemQueueProcessor', () => {
  let processor: SystemQueueProcessor;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    processor = new SystemQueueProcessor();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should process cleanup job correctly', async () => {
      const mockJob: SystemJobLike = {
        id: 'job-1',
        name: JOB_NAMES.CLEANUP,
        data: { triggeredBy: 'cron' },
      };

      const result = await processor.process(mockJob);
      expect(result.status).toBe('completed');
      expect(result.details?.triggeredBy).toBe('cron');
      expect(result.timestamp).toBeDefined();
    });

    it('should process health check job correctly', async () => {
      const mockJob: SystemJobLike = {
        id: 'job-2',
        name: JOB_NAMES.HEALTH_CHECK,
        data: {},
      };

      const result = await processor.process(mockJob);
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle unrecognized job gracefully', async () => {
      const mockJob: SystemJobLike = {
        id: 'job-3',
        name: 'unknown:job',
        data: {},
      };

      const result = await processor.process(mockJob);
      expect(result.status).toBe('ignored');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('event listeners', () => {
    it('should handle onError without throwing', () => {
      expect(() => processor.onError(new Error('Connection failed'))).not.toThrow();
    });

    it('should handle onFailed without throwing', () => {
      const mockJob: SystemJobLike = { id: 'fail-job', name: JOB_NAMES.CLEANUP, data: {} };
      expect(() => processor.onFailed(mockJob, new Error('Failed to run'))).not.toThrow();
      expect(() => processor.onFailed(undefined, new Error('Failed to run'))).not.toThrow();
    });

    it('should handle onCompleted without throwing', () => {
      const mockJob: SystemJobLike = { id: 'done-job', name: JOB_NAMES.CLEANUP, data: {} };
      expect(() => processor.onCompleted(mockJob)).not.toThrow();
    });
  });
});
