export interface GeoInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string | null;
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    });
  });
}

async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=17&accept-language=id`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data.display_name !== 'string') return null;
    // Ambil 4 bagian pertama supaya tidak terlalu panjang
    return data.display_name.split(',').slice(0, 4).map((part: string) => part.trim()).join(', ');
  } catch {
    return null;
  }
}

export async function getGeoInfo(): Promise<GeoInfo> {
  const position = await getCurrentPosition();
  const { latitude, longitude, accuracy } = position.coords;
  const address = await reverseGeocode(latitude, longitude);
  return { latitude, longitude, accuracy, address };
}

export function describeGeoError(err: unknown): string {
  const code = typeof err === 'object' && err !== null && 'code' in err ? Number(err.code) : 0;
  if (code === 1) return 'Izin lokasi ditolak. Aktifkan izin lokasi di browser agar lokasi tercatat.';
  if (code === 2) return 'Lokasi tidak dapat ditentukan. Pastikan GPS atau layanan lokasi aktif.';
  if (code === 3) return 'Waktu mendeteksi lokasi habis.';
  return 'Browser tidak mendukung deteksi lokasi.';
}