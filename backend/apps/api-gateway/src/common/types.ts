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