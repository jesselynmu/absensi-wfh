import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendanceServiceService } from './attendance-service.service';

@Controller()
export class AttendanceServiceController {
  constructor(private readonly attendanceService: AttendanceServiceService) {}

  @MessagePattern({ cmd: 'attendance.checkIn' })
  checkIn(@Payload() data: { employeeId: number; photoPath: string; notes?: string }) {
    return this.attendanceService.checkIn(data);
  }

  @MessagePattern({ cmd: 'attendance.today' })
  findToday(@Payload() data: { employeeId: number }) {
    return this.attendanceService.findToday(data.employeeId);
  }

  @MessagePattern({ cmd: 'attendance.mine' })
  findMine(@Payload() data: { employeeId: number }) {
    return this.attendanceService.findMine(data.employeeId);
  }
}