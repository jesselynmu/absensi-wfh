import { IsDateString, IsIn, IsOptional, Matches, MaxLength } from 'class-validator';

export const GENDERS = ['MALE', 'FEMALE'] as const;
export const MARITAL_STATUSES = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'] as const;

export type Gender = (typeof GENDERS)[number];
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export class PersonalDataDto {
  @IsOptional()
  @MaxLength(255, { message: 'Domisili maksimal 255 karakter' })
  domicile?: string | null;

  @IsOptional()
  @MaxLength(100, { message: 'Tempat lahir maksimal 100 karakter' })
  birthPlace?: string | null;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal lahir tidak valid' })
  birthDate?: string | null;

  @IsOptional()
  @IsIn(GENDERS, { message: 'Gender tidak valid' })
  gender?: Gender | null;

  @IsOptional()
  @IsIn(MARITAL_STATUSES, { message: 'Status pernikahan tidak valid' })
  maritalStatus?: MaritalStatus | null;

  @IsOptional()
  @Matches(/^\d{16}$/, { message: 'No. KTP harus 16 digit angka' })
  identityNumber?: string | null;

  @IsOptional()
  @Matches(/^\d{15,16}$/, { message: 'No. NPWP harus 15 atau 16 digit angka' })
  npwpNumber?: string | null;
}