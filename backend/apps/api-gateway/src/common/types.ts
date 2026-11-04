import type { UserRole } from '../auth/jwt-payload';

export interface EmployeeRecord {
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
  gender: string | null;
  maritalStatus: string | null;
  identityNumber: string | null;
  npwpNumber: string | null;
  isActive: boolean;
}

export interface AccountRecord {
  id: number;
  employeeId: number;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  attendanceDate: string;
  checkInTime: string;
  photoPath: string;
  notes: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}