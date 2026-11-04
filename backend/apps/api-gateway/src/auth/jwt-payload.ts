export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface JwtPayload {
  sub: number;
  employeeId: number;
  email: string;
  role: UserRole;
  mustChangePassword?: boolean;
}