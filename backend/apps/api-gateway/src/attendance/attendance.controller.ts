import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { unlink } from 'fs/promises';
import { diskStorage } from 'multer';
import { basename, extname, join } from 'path';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt-payload';
import { Roles } from '../auth/roles.decorator';
import { attachEmployees } from '../common/attach-employees';
import { sendToService } from '../common/send-to-service';
import type { AttendanceRecord, EmployeeRecord, PaginatedResult } from '../common/types';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CheckInDto } from './dto/check-in.dto';
import { MyAttendanceQueryDto } from './dto/my-attendance-query.dto';

export const UPLOAD_DIR = join(process.cwd(), 'uploads');

@ApiTags('Attendances')
@ApiBearerAuth()
@Controller('attendances')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(
    @Inject('ATTENDANCE_SERVICE') private readonly client: ClientProxy,
    @Inject('EMPLOYEE_SERVICE') private readonly employees: ClientProxy,
  ) {}

  @Post('check-in')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) =>
          cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname).toLowerCase()}`,
          ),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('File harus berupa gambar'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: 'Absen hari ini dengan foto bukti',
    description: 'Setiap karyawan hanya bisa absen satu kali per hari.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['photo'],
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
          description: 'Foto bukti bekerja dari rumah (gambar, maks. 5 MB)',
        },
        notes: {
          type: 'string',
          maxLength: 255,
          example: 'Mengerjakan laporan bulanan',
        },
        latitude: { type: 'string', example: '-6.2088' },
        longitude: { type: 'string', example: '106.8456' },
        locationAddress: { type: 'string', example: 'Jakarta Selatan' },
      },
    },
  })
  async checkIn(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() photo: Express.Multer.File | undefined,
    @Body() body: CheckInDto,
  ) {
    if (!photo) throw new BadRequestException('Foto bukti wajib diunggah');

    try {
      return await sendToService(this.client, { cmd: 'attendance.checkIn' }, {
        employeeId: user.employeeId,
        photoPath: `uploads/${photo.filename}`,
        notes: body.notes,
        latitude: body.latitude ? Number(body.latitude) : undefined,
        longitude: body.longitude ? Number(body.longitude) : undefined,
        locationAddress: body.locationAddress,
      });
    } catch (err) {
      // Absen ditolak (misal sudah absen), hapus foto yang terlanjur tersimpan
      await unlink(photo.path).catch(() => undefined);
      throw err;
    }
  }

  @Get('today')
  @ApiOperation({ summary: 'Status absensi hari ini milik user yang login' })
  today(@CurrentUser() user: JwtPayload) {
    return sendToService(this.client, { cmd: 'attendance.today' }, {
      employeeId: user.employeeId,
    });
  }

  @Get('me')
  @ApiOperation({
    summary: 'Riwayat absensi milik user yang login',
    description:
      'Tanpa filter: 30 absensi terakhir. Dengan filter tanggal: maksimal 100 data.',
  })
  mine(@CurrentUser() user: JwtPayload, @Query() query: MyAttendanceQueryDto) {
    return sendToService(this.client, { cmd: 'attendance.mine' }, {
      employeeId: user.employeeId,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Monitoring semua absensi (admin)',
    description:
      'View only, dengan pagination. Pencarian mencakup nama, kode, dan email karyawan.',
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: AttendanceQueryDto,
  ) {
    const { startDate, endDate, page, limit } = query;
    const search = query.search?.trim();

    // Langkah 1: kalau ada kata kunci, cari id karyawan yang cocok di employee-service
    let employeeIds: number[] | undefined;
    if (search) {
      const matches = await sendToService<EmployeeRecord[]>(
        this.employees,
        { cmd: 'employee.findAll' },
        { search },
      );
      employeeIds = matches.map((employee) => employee.id);

      // Tidak ada karyawan yang cocok: tidak perlu bertanya ke attendance-service
      if (employeeIds.length === 0) {
        return { items: [], total: 0, page, limit, totalPages: 1 };
      }
    }

    // Langkah 2: ambil satu halaman data absensi
    const result = await sendToService<PaginatedResult<AttendanceRecord>>(
      this.client,
      { cmd: 'attendance.findPage' },
      { startDate, endDate, employeeIds, page, limit },
    );

    // Langkah 3: tempelkan nama karyawan ke setiap baris
    return { ...result, items: await attachEmployees(this.employees, result.items) };
  }

  @Get(':id/photo')
  @ApiOperation({
    summary: 'Foto bukti absensi',
    description:
      'Admin dapat melihat semua foto, karyawan hanya fotonya sendiri. ' +
      'Mengembalikan 404 jika data tidak ada atau bukan milik user.',
  })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  async photo(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const attendance = await sendToService<AttendanceRecord>(
      this.client,
      { cmd: 'attendance.findOne' },
      { id },
    );

    // Admin boleh melihat semua foto, karyawan hanya fotonya sendiri.
    // Sengaja 404 (bukan 403) supaya tidak ketahuan bahwa id itu ada.
    const isOwner = attendance.employeeId === user.employeeId;
    if (user.role !== 'ADMIN' && !isOwner) {
      throw new NotFoundException('Data absensi tidak ditemukan');
    }

    const filePath = join(UPLOAD_DIR, basename(attendance.photoPath));
    res.sendFile(filePath, { headers: { 'Cache-Control': 'private, no-store' } }, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ message: 'File foto tidak ditemukan' });
      }
    });
  }
}