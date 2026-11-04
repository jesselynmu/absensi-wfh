import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync } from 'fs';
import { ApiGatewayModule } from './api-gateway.module';
import { UPLOAD_DIR } from './attendance/attendance.controller';

async function bootstrap() {
  mkdirSync(UPLOAD_DIR, { recursive: true });

  const app = await NestFactory.create(ApiGatewayModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Absensi WFH API')
      .setDescription(
        'API Gateway aplikasi Absensi WFH. Login lewat POST /api/auth/login, ' +
          'lalu klik tombol Authorize dan tempelkan accessToken yang didapat.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = Number(process.env.GATEWAY_PORT ?? 3000);
  await app.listen(port);
  console.log(`api-gateway running on http://localhost:${port}/api`);
}
bootstrap();