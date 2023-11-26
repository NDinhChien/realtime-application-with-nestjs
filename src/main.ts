import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './shared/core/adapter/redis-io.adapter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CustomSocketIoAdapter } from './shared/core/adapter/custom-socket-io.adapter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from './app.config';
import { AvatarConfig, createStorageFolder } from './features/media/media.config';

const redis = AppConfig.redis;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const options = new DocumentBuilder()
  .setTitle('API docs')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
  app.enableShutdownHooks();
  app.set('trust proxy', AppConfig.proxyEnabled);
  createStorageFolder();
  app.useStaticAssets(AvatarConfig.path, {prefix: '/avatar/'})

  if (redis.enabled) {
    app.useWebSocketAdapter(new RedisIoAdapter(redis.host, redis.port, app));
  } else {
    app.useWebSocketAdapter(new CustomSocketIoAdapter(app));
  }

  const port = AppConfig.port;
  const logger = new Logger('NestApplication');

  await app.listen(port, () =>
    logger.log(`Server initialized on port ${port}`),
  );
}

bootstrap();

