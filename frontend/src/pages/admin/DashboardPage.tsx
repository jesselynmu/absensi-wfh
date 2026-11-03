import { TrendingUp, UserCheck, Users, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../../api/client';
import { Alert } from '../../components/Alert';
import { Avatar } from '../../components/Avatar';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import type { Attendance, DashboardSummary } from '../../types/attendance';
import { formatDate, formatTime } from '../../utils/format';

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [myToday, setMyToday] = useState<Attendance | null | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<DashboardSummary>('/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch((err) => setError(getErrorMessage(err)));

    api
      .get<{ attendance: Attendance | null }>('/attendances/today')
      .then((res) => setMyToday(res.data.attendance))
      .catch(() => undefined);
  }, []);

  const rate =
    summary && summary.activeEmployees > 0
      ? Math.round((summary.presentToday / summary.activeEmployees) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          summary ? `Ringkasan absensi ${formatDate(summary.date)}` : 'Ringkasan absensi hari ini'
        }
      />

      {myToday === null && (
        <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-800">Anda belum melakukan absensi hari ini.</p>
          <Link to="/absensi" className="text-sm font-semibold text-amber-900 hover:underline">
            Absen sekarang →
          </Link>
        </div>
      )}

      {error && <Alert>{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Karyawan Aktif"
          value={summary?.activeEmployees ?? '-'}
          hint={summary ? `dari ${summary.totalEmployees} total karyawan` : undefined}
          icon={Users}
          tone="slate"
        />
        <StatCard label="Sudah Absen" value={summary?.presentToday ?? '-'} icon={UserCheck} tone="green" />
        <StatCard label="Belum Absen" value={summary?.absentToday ?? '-'} icon={UserX} tone="amber" />
        <StatCard
          label="Tingkat Kehadiran"
          value={summary ? `${rate}%` : '-'}
          icon={TrendingUp}
          tone="brand"
        />
      </div>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Absensi Terbaru Hari Ini</h2>
          <Link to="/monitoring" className="text-sm font-medium text-brand-600 hover:underline">
            Lihat semua
          </Link>
        </div>

        {!summary ? (
          <p className="text-gray-500">Memuat data...</p>
        ) : summary.recentCheckIns.length === 0 ? (
          <p className="text-gray-500">Belum ada karyawan yang absen hari ini.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {summary.recentCheckIns.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <Avatar name={item.employee?.fullName ?? '?'} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">
                    {item.employee?.fullName ?? 'Karyawan tidak ditemukan'}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {item.employee?.employeeCode}
                    {item.employee?.department && ` · ${item.employee.department}`}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-gray-700">
                  {formatTime(item.checkInTime)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}