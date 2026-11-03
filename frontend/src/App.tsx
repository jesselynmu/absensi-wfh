import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomeRedirect, RoleRoute } from './components/RoleRoute';
import { AttendanceMonitorPage } from './pages/admin/AttendanceMonitorPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { EmployeesPage } from './pages/admin/EmployeesPage';
import { AttendancePage } from './pages/AttendancePage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Semua halaman di dalam blok ini memakai sidebar dan wajib login */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/absensi" element={<AttendancePage />} />
        <Route path="/ganti-password" element={<ChangePasswordPage />} />

        {/* Khusus admin HRD */}
        <Route
          element={
            <RoleRoute role="ADMIN">
              <Outlet />
            </RoleRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/karyawan" element={<EmployeesPage />} />
          <Route path="/monitoring" element={<AttendanceMonitorPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}