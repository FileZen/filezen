import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Enable CORS for demo
  app.enableCors();

  await app.listen(3100);
  console.log('🚀 FileZen NestJS Demo running on http://localhost:3100');
}

bootstrap();
