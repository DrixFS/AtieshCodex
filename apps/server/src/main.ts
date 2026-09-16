import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService);

  app.use(compression());

  const port = configService.get<number>('app.port', 3001);
  const globalPrefix = configService.get<string>('app.globalPrefix', 'api');
  const corsOrigin = configService.get<string>('app.corsOrigin', '*');

  app.setGlobalPrefix(globalPrefix);
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
  });

  const swaggerEnabled = configService.get<boolean>('app.swagger.enabled', true);
  if (swaggerEnabled) {
    const swaggerPath = configService.get<string>('app.swagger.path', `${globalPrefix}/docs`);
    const title = configService.get<string>('app.swagger.title', 'Atiesh Codex API');
    const description = configService.get<string>(
      'app.swagger.description',
      'REST and WebSocket API specification for Atiesh Codex services',
    );
    const version = configService.get<string>('app.swagger.version', '1.0.0');

    const swaggerDocConfig = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version)
      .addTag('Health & Monitoring', 'Endpoints for checking server health and connectivity')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerDocConfig);
    SwaggerModule.setup(swaggerPath, app, document, {
      customSiteTitle: 'Atiesh Codex API Docs',
    });
  }

  await app.listen(port);
  logger.log(`Server API is running on: http://localhost:${port}/${globalPrefix}`);
  if (swaggerEnabled) {
    const swaggerPath = configService.get<string>('app.swagger.path', `${globalPrefix}/docs`);
    logger.log(`Swagger documentation available at: http://localhost:${port}/${swaggerPath}`);
  }
}
void bootstrap();
