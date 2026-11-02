export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  employeeId: number;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}