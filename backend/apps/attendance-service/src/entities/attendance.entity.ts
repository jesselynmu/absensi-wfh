import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// MySQL mengembalikan DECIMAL sebagai string, ini mengubahnya jadi number
const decimalToNumber = {
  to: (value?: number | null) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'employee_id' })
  employeeId!: number;

  @Column({ name: 'attendance_date', type: 'date' })
  attendanceDate!: string;

  @Column({ name: 'check_in_time', type: 'datetime' })
  checkInTime!: Date;

  @Column({ name: 'photo_path' })
  photoPath!: string;

  @Column({ type: 'varchar', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, transformer: decimalToNumber })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, transformer: decimalToNumber })
  longitude!: number | null;

  @Column({ name: 'location_address', type: 'varchar', nullable: true })
  locationAddress!: string | null;
}