import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

export function RoleRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'ADMIN' ? '/dashboard' : '/absensi'} replace />;
}