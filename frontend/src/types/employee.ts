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
  isActive: boolean;
  role: UserRole | null;
}