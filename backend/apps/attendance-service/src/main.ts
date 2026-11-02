import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AttendanceServiceModule } from './attendance-service.module';

async function bootstrap() {
  const port = Number(process.env.ATTENDANCE_SERVICE_PORT ?? 3003);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AttendanceServiceModule,
    { transport: Transport.TCP, options: { host: '0.0.0.0', port } },
  );
  await app.listen();
  console.log(`attendance-service listening on TCP port ${port}`);
}
bootstrap();