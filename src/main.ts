//src/main.ts

import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '..', '.env'),
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { BigIntInterceptor } from './interceptors/bigint.interceptor';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.useGlobalInterceptors(new BigIntInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Serve static assets
app.useStaticAssets(
  path.join(__dirname, '..', 'public'),
  { prefix: '/' },
);


  // API routes stay under /api
  app.setGlobalPrefix('api');

  // CORS for Angular
  app.enableCors({
    origin: 'http://localhost:4200',
  });

  await app.listen(3000);
}
bootstrap();
