import { IsDateString, IsOptional, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AttendanceQueryDto extends PaginationQueryDto {
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

  /**
   * Cari berdasarkan nama, kode, atau email karyawan
   * @example budi
   */
  @IsOptional()
  @MaxLength(100, { message: 'Kata kunci maksimal 100 karakter' })
  search?: string;
}