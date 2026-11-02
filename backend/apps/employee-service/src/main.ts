import { NestFactory } from '@nestjs/core';
import { EmployeeServiceModule } from './employee-service.module';

async function bootstrap() {
  const app = await NestFactory.create(EmployeeServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
