import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EmployeeServiceModule } from './employee-service.module';

async function bootstrap() {
  const port = Number(process.env.EMPLOYEE_SERVICE_PORT ?? 3002);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EmployeeServiceModule,
    { transport: Transport.TCP, options: { host: '0.0.0.0', port } },
  );
  await app.listen();
  console.log(`employee-service listening on TCP port ${port}`);
}
bootstrap();