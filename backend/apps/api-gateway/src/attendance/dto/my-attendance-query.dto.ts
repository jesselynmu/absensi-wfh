import { IsDateString, IsOptional } from 'class-validator';

export class MyAttendanceQueryDto {
  /**
   * Tanggal awal (YYYY-MM-DD)
   * @example 2026-11-01
   */
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal awal tidak valid' })
  startDate?: string;

  /**
   * Tanggal akhir (YYYY-MM-DD)
   * @example 2026-11-30
   */
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal akhir tidak valid' })
  endDate?: string;
}