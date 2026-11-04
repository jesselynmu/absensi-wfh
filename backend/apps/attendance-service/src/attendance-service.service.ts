import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Attendance } from './entities/attendance.entity';

export interface AttendanceFilter {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  employeeIds?: number[];
}

export interface AttendancePageFilter extends AttendanceFilter {
  page: number;
  limit: number;
}

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

  findMine(data: { employeeId: number; startDate?: string; endDate?: string }) {
    const where = this.buildWhere({ startDate: data.startDate, endDate: data.endDate });
    // employeeId selalu dari token, dipasang paling akhir supaya tidak bisa ditimpa
    where.employeeId = data.employeeId;

    const filtered = Boolean(data.startDate || data.endDate);

    return this.repo.find({
      where,
      order: { attendanceDate: 'DESC' },
      take: filtered ? 100 : 30,
    });
  }

  private buildWhere(filter: AttendanceFilter) {
    const where: FindOptionsWhere<Attendance> = {};

    if (filter.employeeIds) {
      where.employeeId = In(filter.employeeIds);
    } else if (filter.employeeId) {
      where.employeeId = filter.employeeId;
    }

    if (filter.startDate && filter.endDate) {
      where.attendanceDate = Between(filter.startDate, filter.endDate);
    } else if (filter.startDate) {
      where.attendanceDate = MoreThanOrEqual(filter.startDate);
    } else if (filter.endDate) {
      where.attendanceDate = LessThanOrEqual(filter.endDate);
    }

    return where;
  }

  // Dipakai dashboard (absensi hari ini), tanpa pagination
  findAll(filter: AttendanceFilter) {
    return this.repo.find({
      where: this.buildWhere(filter),
      order: { attendanceDate: 'DESC', checkInTime: 'DESC' },
      take: 500,
    });
  }

  // Dipakai halaman monitoring admin, dengan pagination
  async findPage(filter: AttendancePageFilter) {
    // Batasi lagi di sini sebagai lapis pengaman kedua
    const page = Math.max(Math.floor(filter.page) || 1, 1);
    const limit = Math.min(Math.max(Math.floor(filter.limit) || 20, 1), 100);

    const [items, total] = await this.repo.findAndCount({
      where: this.buildWhere(filter),
      order: { attendanceDate: 'DESC', checkInTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
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