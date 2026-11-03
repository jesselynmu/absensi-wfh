import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import { Button } from '../components/Button';
import { LiveClock } from '../components/LiveClock';
import { PhotoPicker } from '../components/PhotoPicker';
import type { Attendance } from '../types/attendance';
import { fileUrl, formatDate, formatTime } from '../utils/format';
import { PageHeader } from '../components/PageHeader';

export function AttendancePage() {
  const [today, setToday] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    const [todayRes, historyRes] = await Promise.all([
      api.get<{ attendance: Attendance | null }>('/attendances/today'),
      api.get<Attendance[]>('/attendances/me'),
    ]);
    setToday(todayRes.data.attendance);
    setHistory(historyRes.data);
  }, []);

  useEffect(() => {
    loadData()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [loadData]);

  const handleSubmit = async () => {
    if (!photo) {
      setError('Silakan ambil foto bukti terlebih dahulu');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('photo', photo);
      if (notes.trim()) form.append('notes', notes.trim());
      await api.post('/attendances/check-in', form);
      setPhoto(null);
      setNotes('');
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Absensi Saya" description="Catat kehadiran WFH Anda setiap hari." />
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-1/2">
            <LiveClock />

            {loading ? (
              <p className="mt-6 text-gray-500">Memuat status absensi...</p>
            ) : today ? (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="font-semibold text-green-800">✓ Anda sudah absen hari ini</p>
                <p className="mt-1 text-sm text-green-700">
                  Tercatat pukul {formatTime(today.checkInTime)} WIB
                </p>
                {today.notes && (
                  <p className="mt-2 text-sm text-green-700">Catatan: {today.notes}</p>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold text-amber-800">Anda belum absen hari ini</p>
                <p className="mt-1 text-sm text-amber-700">
                  Ambil foto sebagai bukti sedang bekerja dari rumah.
                </p>
              </div>
            )}
          </div>

          <div className="lg:w-1/2">
            {today ? (
              <img
                src={fileUrl(today.photoPath)}
                alt="Foto bukti absensi hari ini"
                className="h-64 w-full rounded-xl object-cover"
              />
            ) : (
              !loading && (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSubmit();
                  }}
                >
                  <PhotoPicker file={photo} onChange={setPhoto} />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan (opsional), misal: mengerjakan laporan bulanan"
                    maxLength={255}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  {error && (
                    <div className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2.5 text-sm text-brand-700">
                      {error}
                    </div>
                  )}
                  <Button type="submit" loading={submitting} className="w-full">
                    Absen Sekarang
                  </Button>
                </form>
              )
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Riwayat Absensi</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">Belum ada riwayat absensi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">Tanggal</th>
                  <th className="py-2 pr-4 font-medium">Jam</th>
                  <th className="py-2 pr-4 font-medium">Catatan</th>
                  <th className="py-2 font-medium">Foto</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4 whitespace-nowrap">{formatDate(item.attendanceDate)}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{formatTime(item.checkInTime)}</td>
                    <td className="py-3 pr-4 text-gray-600">{item.notes ?? '-'}</td>
                    <td className="py-3">
                      <a
                        href={fileUrl(item.photoPath)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-brand-600 hover:underline"
                      >
                        Lihat
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}