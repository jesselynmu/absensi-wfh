import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt-payload';
import { Roles } from '../auth/roles.decorator';
import { sendToService } from '../common/send-to-service';
import type { AccountRecord, EmployeeRecord, PaginatedResult } from '../common/types';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AllowDuringPasswordChange } from '../auth/allow-during-password-change.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(
    @Inject('EMPLOYEE_SERVICE') private readonly employees: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly auth: ClientProxy,
    @Inject('ATTENDANCE_SERVICE') private readonly attendance: ClientProxy,
  ) {}

  private async withRoles(list: EmployeeRecord[]) {
    if (list.length === 0) return [];
    const accounts = await sendToService<AccountRecord[]>(
      this.auth,
      { cmd: 'auth.findAccounts' },
      { employeeIds: list.map((e) => e.id) },
    );
    const roleByEmployee = new Map(accounts.map((a) => [a.employeeId, a.role]));
    return list.map((e) => ({ ...e, role: roleByEmployee.get(e.id) ?? null }));
  }

  // Profil user yang sedang login (dipakai semua role untuk menampilkan nama)
  @Get('me')
  @AllowDuringPasswordChange()
  @ApiOperation({ summary: 'Profil user yang sedang login' })
  async me(@CurrentUser() user: JwtPayload) {
    const employee = await sendToService<EmployeeRecord>(
      this.employees,
      { cmd: 'employee.findOne' },
      { id: user.employeeId },
    );
    return { ...employee, role: user.role };
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Daftar karyawan (admin)',
    description: 'Dengan pagination. Pencarian mencakup nama, kode, dan email.',
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: EmployeeQueryDto,
  ) {
    const result = await sendToService<PaginatedResult<EmployeeRecord>>(
      this.employees,
      { cmd: 'employee.findPage' },
      {
        search: query.search?.trim() || undefined,
        status: query.status,
        page: query.page,
        limit: query.limit,
      },
    );

    // Role diambil dari auth-service hanya untuk karyawan di halaman ini
    return { ...result, items: await this.withRoles(result.items) };
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Detail karyawan (admin)' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const employee = await sendToService<EmployeeRecord>(
      this.employees,
      { cmd: 'employee.findOne' },
      { id },
    );
    const [result] = await this.withRoles([employee]);
    return result;
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Tambah karyawan beserta akun login (admin)',
    description: 'Kode karyawan dan password sementara dibuat otomatis oleh sistem.',
  })
  async create(@Body() dto: CreateEmployeeDto) {
    const { role, ...employeeData } = dto;

    const employee = await sendToService<EmployeeRecord>(
      this.employees,
      { cmd: 'employee.create' },
      employeeData,
    );

    try {
      const account = await sendToService<{ temporaryPassword: string }>(
        this.auth,
        { cmd: 'auth.createAccount' },
        { employeeId: employee.id, email: employee.email, role },
      );
      // Password sementara hanya dikirim sekali, di respons ini saja
      return { ...employee, role, temporaryPassword: account.temporaryPassword };
    } catch (err) {
      await sendToService(this.employees, { cmd: 'employee.remove' }, { id: employee.id })
        .catch(() => undefined);
      throw err;
    }
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Ubah data karyawan (admin)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const isSelf = id === user.employeeId;
    if (isSelf && (dto.isActive === false || (dto.role && dto.role !== 'ADMIN'))) {
      throw new BadRequestException(
        'Anda tidak dapat menonaktifkan atau menurunkan role akun Anda sendiri',
      );
    }

    const { role, ...changes } = dto;

    const employee = await sendToService<EmployeeRecord>(
      this.employees,
      { cmd: 'employee.update' },
      { id, changes },
    );

    await sendToService(this.auth, { cmd: 'auth.updateAccount' }, {
      employeeId: id,
      email: employee.email,
      isActive: employee.isActive,
      role,
    });

    const [result] = await this.withRoles([employee]);
    return result;
  }

  @Post(':id/reset-password')
  @Roles('ADMIN')
  @HttpCode(200)
  @ApiOperation({ summary: 'Buat password sementara baru untuk karyawan (admin)' })
  resetPassword(@Param('id', ParseIntPipe) id: number) {
    return sendToService<{ temporaryPassword: string }>(
      this.auth,
      { cmd: 'auth.resetPassword' },
      { employeeId: id },
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Hapus karyawan (admin)',
    description: 'Ditolak jika karyawan sudah memiliki riwayat absensi. Nonaktifkan saja.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    if (id === user.employeeId) {
      throw new BadRequestException('Anda tidak dapat menghapus akun Anda sendiri');
    }

    const { count } = await sendToService<{ count: number }>(
      this.attendance,
      { cmd: 'attendance.countByEmployee' },
      { employeeId: id },
    );
    if (count > 0) {
      throw new ConflictException(
        'Karyawan ini sudah memiliki riwayat absensi sehingga tidak dapat dihapus. Nonaktifkan saja agar riwayatnya tetap tersimpan.',
      );
    }

    await sendToService(this.employees, { cmd: 'employee.remove' }, { id });
    return { message: 'Data karyawan berhasil dihapus' };
  }
}