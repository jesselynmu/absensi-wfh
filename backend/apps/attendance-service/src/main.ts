import { NestFactory } from '@nestjs/core';
import { AttendanceServiceModule } from './attendance-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AttendanceServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
