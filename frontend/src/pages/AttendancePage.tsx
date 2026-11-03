import { MapPin } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import { Button } from '../components/Button';
import { LiveClock } from '../components/LiveClock';
import { PageHeader } from '../components/PageHeader';
import { PhotoCapture } from '../components/PhotoCapture';
import { useAuth } from '../context/AuthContext';
import type { Attendance } from '../types/attendance';
import { fileUrl, formatDate, formatTime, mapsUrl } from '../utils/format';
import { describeGeoError, getGeoInfo } from '../utils/location';
import type { GeoInfo } from '../utils/location';
import { Modal } from '../components/Modal';

type GeoStatus = 'loading' | 'ready' | 'unavailable';

export function AttendancePage() {
  const { user } = useAuth();
  const [today, setToday] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Attendance | null>(null);

  const [geo, setGeo] = useState<GeoInfo | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('loading');
  const [geoMessage, setGeoMessage] = useState('');

  const loadData = useCallback(async () => {
    const [todayRes, historyRes] = await Promise.all([
      api.get<{ attendance: Attendance | null }>('/attendances/today'),
      api.get<Attendance[]>('/attendances/me'),
    ]);
    setToday(todayRes.data.attendance);
    setHistory(historyRes.data);
  }, []);

  const fetchLocation = useCallback(
    () =>
      getGeoInfo()
        .then((info) => {
          setGeo(info);
          setGeoStatus('ready');
        })
        .catch((err) => {
          setGeo(null);
          setGeoMessage(describeGeoError(err));
          setGeoStatus('unavailable');
        }),
    [],
  );

  useEffect(() => {
    loadData()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
    void fetchLocation();
  }, [loadData, fetchLocation]);

  const retryLocation = () => {
    setGeoStatus('loading');
    void fetchLocation();
  };

  const getWatermarkLines = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
    const date = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });

    const lines = [`${time} WIB`, date];
    if (geo) {
      if (geo.address) lines.push(geo.address);
      lines.push(
        `${geo.latitude.toFixed(6)}, ${geo.longitude.toFixed(6)} (±${Math.round(geo.accuracy)} m)`,
      );
    } else {
      lines.push('Lokasi tidak tersedia');
    }
    lines.push(`Absensi WFH · ${user?.email ?? ''}`);
    return lines;
  };

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
      if (geo) {
        form.append('latitude', String(geo.latitude));
        form.append('longitude', String(geo.longitude));
        if (geo.address) form.append('locationAddress', geo.address);
      }
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
                {today.latitude !== null && today.longitude !== null && (
                  <a
                    href={mapsUrl(today.latitude, today.longitude)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-start gap-1.5 text-sm text-green-700 hover:underline"
                  >
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    {today.locationAddress ?? 'Lihat lokasi di peta'}
                  </a>
                )}
                {today.notes && (
                  <p className="mt-2 text-sm text-green-700">Catatan: {today.notes}</p>
                )}
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-800">Anda belum absen hari ini</p>
                  <p className="mt-1 text-sm text-amber-700">
                    Ambil foto sebagai bukti sedang bekerja dari rumah.
                  </p>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-brand-500" />
                  {geoStatus === 'loading' && (
                    <span className="text-gray-500">Mendeteksi lokasi Anda...</span>
                  )}
                  {geoStatus === 'ready' && geo && (
                    <span className="text-gray-700">
                      {geo.address ?? `${geo.latitude.toFixed(6)}, ${geo.longitude.toFixed(6)}`}
                      <span className="text-gray-400"> (±{Math.round(geo.accuracy)} m)</span>
                    </span>
                  )}
                  {geoStatus === 'unavailable' && (
                    <span className="text-amber-700">
                      {geoMessage}{' '}
                      <button
                        type="button"
                        onClick={retryLocation}
                        className="font-semibold underline"
                      >
                        Coba lagi
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:w-1/2">
            {today ? (
              <img
                src={fileUrl(today.photoPath)}
                alt="Foto bukti absensi hari ini"
                className="aspect-[4/3] w-full rounded-xl object-cover"
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
                  <PhotoCapture
                    file={photo}
                    onChange={setPhoto}
                    getWatermarkLines={getWatermarkLines}
                    disabled={geoStatus === 'loading'}
                  />
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
                  <Button type="submit" loading={submitting} disabled={!photo} className="w-full">
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
                  <th className="py-2 pr-4 font-medium">Lokasi</th>
                  <th className="py-2 pr-4 font-medium">Catatan</th>
                  <th className="py-2 font-medium">Foto</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0">
                    <td className="whitespace-nowrap py-3 pr-4">{formatDate(item.attendanceDate)}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{formatTime(item.checkInTime)}</td>
                    <td className="max-w-[220px] py-3 pr-4 text-gray-600">
                      {item.latitude !== null && item.longitude !== null ? (
                        <a
                          href={mapsUrl(item.latitude, item.longitude)}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-brand-600 hover:underline"
                          title={item.locationAddress ?? undefined}
                        >
                          {item.locationAddress ?? 'Lihat peta'}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{item.notes ?? '-'}</td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => setPreview(item)}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

              {preview && (
        <Modal
          title={`Foto Absensi · ${formatDate(preview.attendanceDate)}`}
          onClose={() => setPreview(null)}
          size="lg"
        >
          <img
            src={fileUrl(preview.photoPath)}
            alt="Foto bukti absensi"
            className="w-full rounded-xl object-contain"
          />
          <p className="mt-3 text-sm text-gray-500">
            Tercatat pukul {formatTime(preview.checkInTime)} WIB
          </p>
          {preview.latitude !== null && preview.longitude !== null && (
            <a
              href={mapsUrl(preview.latitude, preview.longitude)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-start gap-1.5 text-sm text-brand-600 hover:underline"
            >
              <MapPin size={14} className="mt-0.5 shrink-0" />
              {preview.locationAddress ?? 'Lihat lokasi di peta'}
            </a>
          )}
          {preview.notes && (
            <p className="mt-1 text-sm text-gray-700">Catatan: {preview.notes}</p>
          )}
        </Modal>
      )}
      </section>
    </div>
  );
}