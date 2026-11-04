import { Eye, MapPin, RotateCcw } from 'lucide-react'; // BARU: MapPin
import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../api/client';
import { Alert } from '../../components/Alert';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { SecureImage } from '../../components/SecureImage';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import type { AttendanceWithEmployee } from '../../types/attendance';
import type { Employee } from '../../types/employee';
import {
  attendancePhotoPath,
  daysAgo,
  formatDate,
  formatTime,
  mapsUrl,
  toISODate,
} from '../../utils/format';

const defaultFilter = () => ({
  startDate: daysAgo(6),
  endDate: toISODate(new Date()),
  employeeId: '',
});

export function AttendanceMonitorPage() {
  const [filter, setFilter] = useState(defaultFilter);
  const [records, setRecords] = useState<AttendanceWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<AttendanceWithEmployee | null>(null);

  useEffect(() => {
    api
      .get<Employee[]>('/employees')
      .then((res) => setEmployees(res.data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get<AttendanceWithEmployee[]>('/attendances', {
        params: {
          startDate: filter.startDate || undefined,
          endDate: filter.endDate || undefined,
          employeeId: filter.employeeId || undefined,
        },
      })
      .then((res) => {
        if (!cancelled) {
          setRecords(res.data);
          setError('');
        }
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const updateFilter = (field: keyof ReturnType<typeof defaultFilter>, value: string) => {
    setLoading(true);
    setFilter((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring Absensi"
        description="Pantau absensi WFH seluruh karyawan."
        action={<Badge tone="gray">Hanya lihat</Badge>}
      />

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <TextField
            label="Dari tanggal"
            name="startDate"
            type="date"
            value={filter.startDate}
            max={filter.endDate || undefined}
            onChange={(e) => updateFilter('startDate', e.target.value)}
          />
          <TextField
            label="Sampai tanggal"
            name="endDate"
            type="date"
            value={filter.endDate}
            min={filter.startDate || undefined}
            onChange={(e) => updateFilter('endDate', e.target.value)}
          />
          <SelectField
            label="Karyawan"
            name="employeeId"
            value={filter.employeeId}
            onChange={(e) => updateFilter('employeeId', e.target.value)}
            options={[
              { value: '', label: 'Semua karyawan' },
              ...employees.map((emp) => ({
                value: String(emp.id),
                label: `${emp.fullName} (${emp.employeeCode})`,
              })),
            ]}
          />
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setFilter(defaultFilter());
            }}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Reset filter
          </button>
        </div>
      </section>

      {error && <Alert>{error}</Alert>}

      <section className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
          {loading ? 'Memuat data...' : `Menampilkan ${records.length} data absensi`}
        </div>

        <div className="overflow-x-auto">
          {/* BARU: lebar minimum dinaikkan karena ada kolom tambahan */}
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Karyawan</th>
                <th className="px-4 py-3 font-medium">Departemen</th>
                <th className="px-4 py-3 font-medium">Jam Masuk</th>
                <th className="px-4 py-3 font-medium">Lokasi</th> {/* BARU */}
                <th className="px-4 py-3 font-medium">Catatan</th>
                <th className="px-4 py-3 font-medium">Foto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && records.length === 0 ? (
                <tr>
                  {/* BARU: colSpan 6 → 7 karena jumlah kolom bertambah */}
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data absensi pada filter ini.
                  </td>
                </tr>
              ) : (
                records.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {formatDate(item.attendanceDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.employee?.fullName ?? '?'} />
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.employee?.fullName ?? 'Tidak ditemukan'}
                          </p>
                          <p className="text-xs text-gray-500">{item.employee?.employeeCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.employee?.department ?? '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-gray-900">
                      {formatTime(item.checkInTime)}
                    </td>

                    {/* BARU: kolom lokasi, link ke Google Maps */}
                    <td className="max-w-[240px] px-4 py-3">
                      {item.latitude !== null && item.longitude !== null ? (
                        <a
                          href={mapsUrl(item.latitude, item.longitude)}
                          target="_blank"
                          rel="noreferrer"
                          title={item.locationAddress ?? undefined}
                          className="flex items-start gap-1.5 text-brand-600 hover:underline"
                        >
                          <MapPin size={14} className="mt-0.5 shrink-0" />
                          <span className="truncate">{item.locationAddress ?? 'Lihat peta'}</span>
                        </a>
                      ) : (
                        <span className="text-gray-400">Tidak tersedia</span>
                      )}
                    </td>

                    <td className="max-w-[220px] px-4 py-3 text-gray-600">
                      <p className="truncate" title={item.notes ?? undefined}>
                        {item.notes ?? '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setPreview(item)}
                        className="group relative block h-12 w-12 overflow-hidden rounded-lg"
                        aria-label="Lihat foto bukti"
                      >
                        <SecureImage
                          path={attendancePhotoPath(item.id)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute inset-0 grid place-items-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
                          <Eye size={16} />
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {preview && (
        <Modal
          title={`Foto Bukti · ${preview.employee?.fullName ?? ''}`}
          onClose={() => setPreview(null)}
          size="lg"
        >
          <SecureImage
            path={attendancePhotoPath(preview.id)}
            alt="Foto bukti absensi"
            className="max-h-[60vh] w-full rounded-xl object-contain"
          />
          <p className="mt-3 text-sm text-gray-500">
            {formatDate(preview.attendanceDate)} · pukul {formatTime(preview.checkInTime)} WIB
          </p>

          {/* BARU: lokasi juga ditampilkan di popup foto */}
          {preview.latitude !== null && preview.longitude !== null ? (
            <a
              href={mapsUrl(preview.latitude, preview.longitude)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-start gap-1.5 text-sm text-brand-600 hover:underline"
            >
              <MapPin size={14} className="mt-0.5 shrink-0" />
              {preview.locationAddress ??
                `${preview.latitude.toFixed(6)}, ${preview.longitude.toFixed(6)}`}
            </a>
          ) : (
            <p className="mt-1 text-sm text-gray-400">Lokasi tidak tersedia</p>
          )}

          {preview.notes && <p className="mt-1 text-sm text-gray-700">Catatan: {preview.notes}</p>}
        </Modal>
      )}
    </div>
  );
}