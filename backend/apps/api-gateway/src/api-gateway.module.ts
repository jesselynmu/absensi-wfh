import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AttendanceController } from './attendance/attendance.controller';
import { AuthController } from './auth/auth.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

const tcpClient = (name: string, hostKey: string, portKey: string, defaultPort: number) => ({
  name,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    transport: Transport.TCP as const,
    options: {
      host: config.get<string>(hostKey, 'localhost'),
      port: Number(config.get(portKey, defaultPort)),
    },
  }),
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
    ClientsModule.registerAsync([
      tcpClient('AUTH_SERVICE', 'AUTH_SERVICE_HOST', 'AUTH_SERVICE_PORT', 3001),
      tcpClient('ATTENDANCE_SERVICE', 'ATTENDANCE_SERVICE_HOST', 'ATTENDANCE_SERVICE_PORT', 3003),
    ]),
  ],
  controllers: [AuthController, AttendanceController],
  providers: [JwtAuthGuard],
})
export class ApiGatewayModule {}