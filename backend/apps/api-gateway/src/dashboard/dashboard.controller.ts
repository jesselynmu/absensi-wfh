import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { attachEmployees } from '../common/attach-employees';
import { sendToService } from '../common/send-to-service';
import type { AttendanceRecord } from '../common/types';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
export class DashboardController {
  constructor(
    @Inject('EMPLOYEE_SERVICE') private readonly employees: ClientProxy,
    @Inject('ATTENDANCE_SERVICE') private readonly attendance: ClientProxy,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Ringkasan dashboard hari ini (admin)',
    description:
      'Total karyawan, jumlah yang sudah dan belum absen hari ini (WIB), ' +
      'serta 5 absensi terbaru hari ini.',
  })
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