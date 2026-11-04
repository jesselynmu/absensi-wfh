import {
  Camera,
  ClipboardList,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { api } from '../api/client';
import logo from '../assets/LogoAplikasi.png';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
  { to: '/karyawan', label: 'Data Karyawan', icon: Users, adminOnly: true },
  { to: '/monitoring', label: 'Monitoring Absensi', icon: ClipboardList, adminOnly: true },
  { to: '/absensi', label: 'Absensi Saya', icon: Camera, adminOnly: false },
  { to: '/ganti-password', label: 'Ganti Password', icon: KeyRound, adminOnly: false },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);

  const items = navItems.filter((item) => !item.adminOnly || user?.role === 'ADMIN');

  useEffect(() => {
    api
      .get<{ fullName: string }>('/employees/me')
      .then((res) => setFullName(res.data.fullName))
      .catch(() => undefined);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5">
          <img src={logo} alt="Logo Absensi WFH" className="h-9 w-9 rounded-lg object-contain" />
          <span className="text-lg font-bold text-gray-900">Absensi WFH</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <p className="truncate text-sm font-semibold text-gray-900">{fullName ?? user?.email}</p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <img src={logo} alt="" className="h-7 w-7 rounded-md object-contain" />
          <span className="font-bold text-gray-900">Absensi WFH</span>
          </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}