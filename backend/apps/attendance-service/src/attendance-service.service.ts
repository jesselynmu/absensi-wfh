import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';

const todayInJakarta = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

const alreadyCheckedIn = () =>
  new RpcException({
    statusCode: HttpStatus.CONFLICT,
    message: 'Anda sudah melakukan absensi hari ini',
  });

@Injectable()
export class AttendanceServiceService {
  constructor(
    @InjectRepository(Attendance) private readonly repo: Repository<Attendance>,
  ) {}

  async checkIn(data: { employeeId: number; photoPath: string; notes?: string }) {
    const today = todayInJakarta();

    const existing = await this.repo.findOne({
      where: { employeeId: data.employeeId, attendanceDate: today },
    });
    if (existing) throw alreadyCheckedIn();

    try {
      return await this.repo.save(
        this.repo.create({
          employeeId: data.employeeId,
          attendanceDate: today,
          checkInTime: new Date(),
          photoPath: data.photoPath,
          notes: data.notes?.trim() || null,
        }),
      );
    } catch (err: any) {
      // Jaga-jaga kalau dua request masuk bersamaan
      if (err?.code === 'ER_DUP_ENTRY') throw alreadyCheckedIn();
      throw err;
    }
  }

  async findToday(employeeId: number) {
    const attendance = await this.repo.findOne({
      where: { employeeId, attendanceDate: todayInJakarta() },
    });
    return { attendance };
  }

  findMine(employeeId: number) {
    return this.repo.find({
      where: { employeeId },
      order: { attendanceDate: 'DESC' },
      take: 30,
    });
  }
}