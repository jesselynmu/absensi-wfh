import { Module } from '@nestjs/common';
import { AttendanceServiceController } from './attendance-service.controller';
import { AttendanceServiceService } from './attendance-service.service';

@Module({
  imports: [],
  controllers: [AttendanceServiceController],
  providers: [AttendanceServiceService],
})
export class AttendanceServiceModule {}
