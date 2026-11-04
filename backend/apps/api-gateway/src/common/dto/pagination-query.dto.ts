import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  /**
   * Nomor halaman, dimulai dari 1
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page harus berupa bilangan bulat' })
  @Min(1, { message: 'page minimal 1' })
  page: number = 1;

  /**
   * Jumlah data per halaman (maksimal 100)
   * @example 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit harus berupa bilangan bulat' })
  @Min(1, { message: 'limit minimal 1' })
  @Max(100, { message: 'limit maksimal 100' })
  limit: number = 20;
}