import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { ApiGatewayModule } from './api-gateway.module';
import { UPLOAD_DIR } from './attendance/attendance.controller';

async function bootstrap() {
  mkdirSync(UPLOAD_DIR, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(ApiGatewayModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useStaticAssets(UPLOAD_DIR, { prefix: '/uploads/' });

  const port = Number(process.env.GATEWAY_PORT ?? 3000);
  await app.listen(port);
  console.log(`api-gateway running on http://localhost:${port}/api`);
}
bootstrap();