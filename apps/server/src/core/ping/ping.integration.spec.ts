import { getQueueToken } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { QUEUES, SystemQueueProcessor } from '../queue';
import { REDIS_CLIENT } from '../redis';

describe('Ping API (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/ping should return 200 with pong message and timestamp', async () => {
    const response = await request(app.getHttpServer()).get('/api/ping').expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.message).toBe('pong');
    expect(typeof response.body.timestamp).toBe('string');
    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
  });
});
