import { Eye, MapPin, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../api/client';
import { Alert } from '../../components/Alert';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { SecureImage } from '../../components/SecureImage';
import { TextField } from '../../components/TextField';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import type { AttendanceWithEmployee } from '../../types/attendance';
import type { PaginatedResult } from '../../types/pagination';
import {
  attendancePhotoPath,
  daysAgo,
  formatDate,
  formatTime,
  mapsUrl,
  toISODate,
} from '../../utils/format';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const defaultFilter = () => ({
  startDate: daysAgo(6),
  endDate: toISODate(new Date()),
  search: '',
});

type Filter = ReturnType<typeof defaultFilter>;

const emptyResult: PaginatedResult<AttendanceWithEmployee> = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export function AttendanceMonitorPage() {
  const [filter, setFilter] = useState(defaultFilter);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [result, setResult] = useState(emptyResult);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<AttendanceWithEmployee | null>(null);

  // Request baru dikirim setelah admin berhenti mengetik selama 400 ms
  const search = useDebouncedValue(filter.search.trim(), 400);

  // Semua parameter request dijadikan satu "kunci". Halaman dianggap
  // sedang memuat selama data yang tampil belum sesuai kunci terbaru.
  const requestKey = JSON.stringify({
    startDate: filter.startDate || undefined,
    endDate: filter.endDate || undefined,
    search: search || undefined,
    page,
    limit,
  });
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;

    api
      .get<PaginatedResult<AttendanceWithEmployee>>('/attendances', {
        params: JSON.parse(requestKey),
      })
      .then((res) => {
        if (cancelled) return;
        setResult(res.data);
        setError('');
        setLoadedKey(requestKey);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err));
        setLoadedKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  // Setiap filter berubah, kembali ke halaman 1
  const updateFilter = (field: keyof Filter, value: string) => {
    setFilter((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const resetFilter = () => {
    setFilter(defaultFilter());
    setPage(1);
  };

  const changeLimit = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const { items, total, totalPages } = result;

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
            label="Cari karyawan"
            name="search"
            value={filter.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Nama, kode, atau email"
            maxLength={100}
          />
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
          <button
            type="button"
            onClick={resetFilter}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Reset filter
          </button>
        </div>
      </section>

      {error && <Alert>{error}</Alert>}

      <section className="rounded-xl bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
          <span>{loading ? 'Memuat data...' : `${total} data absensi ditemukan`}</span>
          <label className="flex items-center gap-2">
            Tampilkan
            <select
              value={limit}
              onChange={(e) => changeLimit(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-700 outline-none focus:ring-2 focus:ring-brand-400"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            per halaman
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Karyawan</th>
                <th className="px-4 py-3 font-medium">Departemen</th>
                <th className="px-4 py-3 font-medium">Jam Masuk</th>
                <th className="px-4 py-3 font-medium">Lokasi</th>
                <th className="px-4 py-3 font-medium">Catatan</th>
                <th className="px-4 py-3 font-medium">Foto</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y divide-gray-100 transition-opacity ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {loading ? 'Memuat data...' : 'Tidak ada data absensi pada filter ini.'}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
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
                      {/* Foto baru dimuat saat popup dibuka, bukan saat tabel tampil */}
                      <button
                        type="button"
                        onClick={() => setPreview(item)}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-brand-600 hover:bg-brand-50"
                      >
                        <Eye size={16} />
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
            disabled={loading}
          />
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