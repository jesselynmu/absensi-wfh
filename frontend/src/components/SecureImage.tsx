import { ImageOff } from 'lucide-react';
import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { api } from '../api/client';

interface SecureImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Endpoint API yang mengembalikan gambar, misalnya /attendances/12/photo */
  path: string;
}

/**
 * Menampilkan gambar yang butuh login.
 * Tag <img> biasa tidak bisa mengirim header Authorization, jadi gambar
 * diambil lewat axios (token ikut otomatis), diubah menjadi URL sementara
 * di browser, lalu URL itu dibersihkan saat komponen tidak dipakai lagi.
 */
export function SecureImage({ path, alt, className = '', ...rest }: SecureImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let createdUrl: string | null = null;
    let cancelled = false;

    setObjectUrl(null);
    setFailed(false);

    api
      .get<Blob>(path, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        createdUrl = URL.createObjectURL(res.data);
        setObjectUrl(createdUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [path]);

  if (failed) {
    return (
      <div
        role="img"
        aria-label="Foto tidak dapat dimuat"
        className={`flex min-h-[10rem] items-center justify-center bg-gray-100 text-gray-400 ${className}`}
      >
        <ImageOff size={28} />
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div
        aria-hidden="true"
        className={`min-h-[10rem] animate-pulse bg-gray-100 ${className}`}
      />
    );
  }

  return <img src={objectUrl} alt={alt} className={className} {...rest} />;
}