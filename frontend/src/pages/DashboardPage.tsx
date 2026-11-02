import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Halo, {user?.email}</h1>
        <p className="mb-5 text-gray-500">Role: {user?.role}</p>
        <Button variant="secondary" onClick={logout}>Keluar</Button>
      </div>
    </div>
  );
}