import { IsLatitude, IsLongitude, IsOptional, MaxLength } from 'class-validator';

export class CheckInDto {
  @IsOptional()
  @MaxLength(255, { message: 'Catatan maksimal 255 karakter' })
  notes?: string;

  @IsOptional()
  @IsLatitude({ message: 'Latitude tidak valid' })
  latitude?: string;

  @IsOptional()
  @IsLongitude({ message: 'Longitude tidak valid' })
  longitude?: string;

  @IsOptional()
  @MaxLength(255)
  locationAddress?: string;
}