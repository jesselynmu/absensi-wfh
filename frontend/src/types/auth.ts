export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  employeeId: number;
  mustChangePassword: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ChangePasswordResponse extends LoginResponse {
  message: string;
}