import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { UserRole } from '../../auth/jwt-payload';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Kode karyawan tidak boleh kosong' })
  @MaxLength(20)
  employeeCode?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong' })
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @IsOptional()
  @MaxLength(20)
  phone?: string | null;

  @IsOptional()
  @MaxLength(50)
  department?: string | null;

  @IsOptional()
  @MaxLength(50)
  position?: string | null;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal bergabung tidak valid' })
  joinDate?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsIn(['ADMIN', 'EMPLOYEE'], { message: 'Role tidak valid' })
  role?: UserRole;

  @IsOptional()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password?: string;
}