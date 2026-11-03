import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { attachEmployees } from '../common/attach-employees';
import { sendToService } from '../common/send-to-service';
import type { AttendanceRecord } from '../common/types';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
export class DashboardController {
  constructor(
    @Inject('EMPLOYEE_SERVICE') private readonly employees: ClientProxy,
    @Inject('ATTENDANCE_SERVICE') private readonly attendance: ClientProxy,
  ) {}

  @Get('summary')
  async summary() {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(
      new Date(),
    );

    const [stats, todayRecords] = await Promise.all([
      sendToService<{ total: number; active: number }>(
        this.employees,
        { cmd: 'employee.stats' },
        {},
      ),
      sendToService<AttendanceRecord[]>(
        this.attendance,
        { cmd: 'attendance.findAll' },
        { startDate: today, endDate: today },
      ),
    ]);

    return {
      date: today,
      totalEmployees: stats.total,
      activeEmployees: stats.active,
      presentToday: todayRecords.length,
      absentToday: Math.max(stats.active - todayRecords.length, 0),
      recentCheckIns: await attachEmployees(this.employees, todayRecords.slice(0, 5)),
    };
  }
}