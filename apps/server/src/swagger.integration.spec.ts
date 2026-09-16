import { getQueueToken } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './app.module';
import { QUEUES, SystemQueueProcessor } from './core/queue';
import { REDIS_CLIENT } from './core/redis';

describe('Swagger Documentation (Integration)', () => {
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

    const config = new DocumentBuilder()
      .setTitle('Atiesh Codex API')
      .setDescription('REST and WebSocket API specification for Atiesh Codex services')
      .setVersion('1.0.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/docs/ should serve Swagger UI HTML', async () => {
    const response = await request(app.getHttpServer()).get('/api/docs/').expect(200);
    expect(response.text).toContain('swagger-ui');
  });

  it('GET /api/docs-json should serve OpenAPI JSON spec', async () => {
    const response = await request(app.getHttpServer()).get('/api/docs-json').expect(200);
    expect(response.body).toBeDefined();
    expect(response.body.openapi).toMatch(/^3\./);
    expect(response.body.info.title).toBe('Atiesh Codex API');
    expect(response.body.paths['/api/ping']).toBeDefined();
  });
});
