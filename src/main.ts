import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestiaSwaggerComposer } from '@nestia/sdk';
import { SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const document = await NestiaSwaggerComposer.document(app, {
    openapi: '3.1',
    servers: [
      {
        url: `http://localhost:${config.get<number>('PORT_NESTJS') ?? 3000}`,
        description: 'Localhost',
      },
    ],
  });

  SwaggerModule.setup('api', app, document as any);

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN') ?? '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(config.get<number>('PORT_NESTJS') ?? 3000);
}
void bootstrap();
