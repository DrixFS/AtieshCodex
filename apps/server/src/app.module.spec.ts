import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { QUEUES, SystemQueueProcessor } from './core/queue';
import { REDIS_CLIENT } from './core/redis';

describe('AppModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(REDIS_CLIENT)
      .useValue({
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        quit: jest.fn().mockResolvedValue('OK'),
        disconnect: jest.fn(),
      })
      .overrideProvider(SystemQueueProcessor)
      .useValue({
        process: jest.fn(),
        onModuleDestroy: jest.fn(),
        onApplicationShutdown: jest.fn(),
      })
      .overrideProvider(getQueueToken(QUEUES.SYSTEM))
      .useValue({
        opts: {
          connection: {
            host: 'localhost',
            port: 6379,
            lazyConnect: true,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
          },
        },
        add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
        isPaused: jest.fn().mockResolvedValue(false),
        on: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined),
      })
      .compile();
  });

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('should compile the module', () => {
    expect(moduleRef).toBeDefined();
  });
});
