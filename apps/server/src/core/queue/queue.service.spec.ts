import { Logger } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { JOB_NAMES, QUEUES } from './queue.constants';
import { QueueService } from './queue.service';

describe('QueueService', () => {
  let service: QueueService;
  let mockQueue: {
    add: jest.Mock;
    isPaused: jest.Mock;
    on: jest.Mock;
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

    mockQueue = {
      add: jest.fn(),
      isPaused: jest.fn().mockResolvedValue(false),
      on: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: getQueueToken(QUEUES.SYSTEM),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.getSystemQueue()).toBe(mockQueue);
  });

  describe('dispatchSystemJob', () => {
    it('should add job to system queue with payload and options', async () => {
      const mockJob = { id: 'job-123', name: JOB_NAMES.CLEANUP };
      mockQueue.add.mockResolvedValue(mockJob);

      const payload = { triggeredBy: 'admin' };
      const options = { priority: 1 };
      const result = await service.dispatchSystemJob(JOB_NAMES.CLEANUP, payload, options);

      expect(result).toBe(mockJob);
      expect(mockQueue.add).toHaveBeenCalledWith(JOB_NAMES.CLEANUP, payload, options);
    });
  });

  describe('triggerCleanup', () => {
    it('should dispatch cleanup job with default triggeredBy', async () => {
      const mockJob = { id: 'job-cleanup' };
      mockQueue.add.mockResolvedValue(mockJob);

      const result = await service.triggerCleanup();
      expect(result).toBe(mockJob);
      expect(mockQueue.add).toHaveBeenCalledWith(
        JOB_NAMES.CLEANUP,
        { triggeredBy: 'manual' },
        undefined,
      );
    });
  });

  describe('triggerHealthCheck', () => {
    it('should dispatch health check job with empty payload', async () => {
      const mockJob = { id: 'job-health' };
      mockQueue.add.mockResolvedValue(mockJob);

      const result = await service.triggerHealthCheck();
      expect(result).toBe(mockJob);
      expect(mockQueue.add).toHaveBeenCalledWith(JOB_NAMES.HEALTH_CHECK, {}, undefined);
    });
  });

  describe('isQueueHealthy', () => {
    it('should return true when queue is not paused', async () => {
      mockQueue.isPaused.mockResolvedValue(false);

      const healthy = await service.isQueueHealthy(QUEUES.SYSTEM);
      expect(healthy).toBe(true);
      expect(mockQueue.isPaused).toHaveBeenCalled();
    });

    it('should return false when queue is paused', async () => {
      mockQueue.isPaused.mockResolvedValue(true);

      const healthy = await service.isQueueHealthy(QUEUES.SYSTEM);
      expect(healthy).toBe(false);
    });

    it('should return false when isPaused throws error', async () => {
      mockQueue.isPaused.mockRejectedValue(new Error('Redis offline'));

      const healthy = await service.isQueueHealthy(QUEUES.SYSTEM);
      expect(healthy).toBe(false);
    });
  });
});
