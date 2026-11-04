import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';

const todayInJakarta = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

const alreadyCheckedIn = () =>
  new RpcException({
    statusCode: HttpStatus.CONFLICT,
    message: 'Anda sudah melakukan absensi hari ini',
  });

export interface CheckInPayload {
  employeeId: number;
  photoPath: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
}

@Injectable()
export class AttendanceServiceService {
  constructor(
    @InjectRepository(Attendance) private readonly repo: Repository<Attendance>,
  ) {}

  async checkIn(data: CheckInPayload) {
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
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          locationAddress: data.locationAddress?.trim() || null,
        }),
      );
    } catch (err: any) {
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

  findAll(filter: { startDate?: string; endDate?: string; employeeId?: number }) {
    const where: FindOptionsWhere<Attendance> = {};
    if (filter.employeeId) where.employeeId = filter.employeeId;

    if (filter.startDate && filter.endDate) {
      where.attendanceDate = Between(filter.startDate, filter.endDate);
    } else if (filter.startDate) {
      where.attendanceDate = MoreThanOrEqual(filter.startDate);
    } else if (filter.endDate) {
      where.attendanceDate = LessThanOrEqual(filter.endDate);
    }

    return this.repo.find({
      where,
      order: { attendanceDate: 'DESC', checkInTime: 'DESC' },
      take: 500,
    });
  }

  async countByEmployee(employeeId: number) {
    return { count: await this.repo.count({ where: { employeeId } }) };
  }

  async findOne(id: number) {
    const attendance = await this.repo.findOne({ where: { id } });
    if (!attendance) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Data absensi tidak ditemukan',
      });
    }
    return attendance;
  }
}