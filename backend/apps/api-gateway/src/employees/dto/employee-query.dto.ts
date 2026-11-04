import { IsIn, IsOptional, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class EmployeeQueryDto extends PaginationQueryDto {
  /**
   * Cari berdasarkan nama, kode, atau email
   * @example budi
   */
  @IsOptional()
  @MaxLength(100, { message: 'Kata kunci maksimal 100 karakter' })
  search?: string;

  /**
   * Filter status akun
   * @example active
   */
  @IsOptional()
  @IsIn(['active', 'inactive'], { message: 'Status harus active atau inactive' })
  status?: 'active' | 'inactive';
}