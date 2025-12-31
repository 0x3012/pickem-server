//src/main.ts

import * as path from 'path';
import * as dotenv from 'dotenv';

 dotenv.config({
  path: path.resolve(__dirname, '..', '.env'),
});

console.log('BOOT DATABASE_URL:', process.env.DATABASE_URL); // TEMP

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
