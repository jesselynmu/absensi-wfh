import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  /** @example admin@company.com */
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  /** @example admin123 */
  @IsNotEmpty({ message: 'Password wajib diisi' })
  password!: string;
}