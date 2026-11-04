import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type Gender = 'MALE' | 'FEMALE';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'employee_code', unique: true })
  employeeCode!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', nullable: true })
  department!: string | null;

  @Column({ type: 'varchar', nullable: true })
  position!: string | null;

  @Column({ name: 'join_date', type: 'date', nullable: true })
  joinDate!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domicile!: string | null;

  @Column({ name: 'birth_place', type: 'varchar', length: 100, nullable: true })
  birthPlace!: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender!: Gender | null;

  @Column({ name: 'marital_status', type: 'varchar', length: 20, nullable: true })
  maritalStatus!: MaritalStatus | null;

  @Index('uq_employees_identity_number', { unique: true })
  @Column({ name: 'identity_number', type: 'varchar', length: 16, nullable: true })
  identityNumber!: string | null;

  @Column({ name: 'npwp_number', type: 'varchar', length: 16, nullable: true })
  npwpNumber!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}