import { IsDateString, IsEmail, IsIn, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import type { UserRole } from '../../auth/jwt-payload';
import { PersonalDataDto } from './personal-data.dto';

export class CreateEmployeeDto extends PersonalDataDto {
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @MaxLength(100)
  fullName!: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

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

  @IsIn(['ADMIN', 'EMPLOYEE'], { message: 'Role tidak valid' })
  role!: UserRole;
}