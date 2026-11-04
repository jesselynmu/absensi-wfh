import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendanceServiceService } from './attendance-service.service';
import type { CheckInPayload } from './attendance-service.service';

@Controller()
export class AttendanceServiceController {
  constructor(private readonly attendanceService: AttendanceServiceService) {}

  @MessagePattern({ cmd: 'attendance.today' })
  findToday(@Payload() data: { employeeId: number }) {
    return this.attendanceService.findToday(data.employeeId);
  }

  @MessagePattern({ cmd: 'attendance.mine' })
  findMine(@Payload() data: { employeeId: number }) {
    return this.attendanceService.findMine(data.employeeId);
  }

  @MessagePattern({ cmd: 'attendance.findAll' })
  findAll(@Payload() filter: { startDate?: string; endDate?: string; employeeId?: number }) {
    return this.attendanceService.findAll(filter);
  }

  @MessagePattern({ cmd: 'attendance.countByEmployee' })
  countByEmployee(@Payload() data: { employeeId: number }) {
    return this.attendanceService.countByEmployee(data.employeeId);
  }

  @MessagePattern({ cmd: 'attendance.checkIn' })
  checkIn(@Payload() data: CheckInPayload) {
    return this.attendanceService.checkIn(data);
  }

  @MessagePattern({ cmd: 'attendance.findOne' })
  findOne(@Payload() data: { id: number }) {
    return this.attendanceService.findOne(data.id);
  }
}