import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Password lama wajib diisi' })
  currentPassword!: string;

  @MinLength(8, { message: 'Password baru minimal 8 karakter' })
  newPassword!: string;
}