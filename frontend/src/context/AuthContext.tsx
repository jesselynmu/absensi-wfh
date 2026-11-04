import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/client';
import type { AuthUser, LoginResponse } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  applySession: (session: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): AuthUser | null {
  const raw = localStorage.getItem('user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  // Simpan token dan data user, dipakai saat login maupun setelah ganti password
  const applySession = useCallback((session: LoginResponse) => {
    localStorage.setItem('token', session.accessToken);
    localStorage.setItem('user', JSON.stringify(session.user));
    setUser(session.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
      applySession(data);
    },
    [applySession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, applySession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}