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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { unlink } from 'fs/promises';
import { diskStorage } from 'multer';
import { basename, extname, join } from 'path';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt-payload';
import { sendToService } from '../common/send-to-service';
import { Roles } from '../auth/roles.decorator';
import { attachEmployees } from '../common/attach-employees';
import type { AttendanceRecord } from '../common/types';
import { CheckInDto } from './dto/check-in.dto';

export const UPLOAD_DIR = join(process.cwd(), 'uploads');

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
      await unlink(photo.path).catch(() => undefined);
      throw err;
    }
  }

  @Get('today')
  today(@CurrentUser() user: JwtPayload) {
    return sendToService(this.client, { cmd: 'attendance.today' }, {
      employeeId: user.employeeId,
    });
  }

  @Get('me')
  mine(@CurrentUser() user: JwtPayload) {
    return sendToService(this.client, { cmd: 'attendance.mine' }, {
      employeeId: user.employeeId,
    });
  }

  @Get()
  @Roles('ADMIN')
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    const records = await sendToService<AttendanceRecord[]>(
      this.client,
      { cmd: 'attendance.findAll' },
      { startDate, endDate, employeeId: employeeId ? Number(employeeId) : undefined },
    );
    return attachEmployees(this.employees, records);
  }

  @Get(':id/photo')
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