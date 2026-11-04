import type { UserRole } from './auth';

export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  department: string | null;
  position: string | null;
  joinDate: string | null;
  domicile: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  gender: Gender | null;
  maritalStatus: MaritalStatus | null;
  identityNumber: string | null;
  npwpNumber: string | null;
  isActive: boolean;
  role: UserRole | null;
}

export interface Credentials {
  fullName: string;
  email: string;
  password: string;
}

export type Gender = 'MALE' | 'FEMALE';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Laki-laki',
  FEMALE: 'Perempuan',
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  SINGLE: 'Belum Menikah',
  MARRIED: 'Menikah',
  DIVORCED: 'Cerai Hidup',
  WIDOWED: 'Cerai Mati',
};