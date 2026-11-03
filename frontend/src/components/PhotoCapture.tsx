import { Camera, RefreshCw, SwitchCamera, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { videoToWatermarked } from '../utils/watermark';
import { Button } from './Button';

interface PhotoCaptureProps {
  file: File | null;
  onChange: (file: File | null) => void;
  getWatermarkLines: () => string[];
  disabled?: boolean;
}

type CameraState = 'idle' | 'starting' | 'live';
type Facing = 'user' | 'environment';

export function PhotoCapture({ file, onChange, getWatermarkLines, disabled }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<CameraState>('idle');
  const [facing, setFacing] = useState<Facing>('user');
  const [canSwitch, setCanSwitch] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const supported = !!navigator.mediaDevices?.getUserMedia;
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // Matikan kamera saat pindah halaman
  useEffect(() => stopCamera, [stopCamera]);

  const startCamera = async (mode: Facing = facing) => {
    stopCamera();
    setMessage('');
    setState('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCanSwitch(devices.filter((d) => d.kind === 'videoinput').length > 1);
      setFacing(mode);
      setState('live');
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      setMessage(
        name === 'NotAllowedError'
          ? 'Izin kamera ditolak. Klik ikon gembok di address bar, izinkan Kamera, lalu coba lagi.'
          : name === 'NotFoundError'
            ? 'Kamera tidak ditemukan di perangkat ini.'
            : 'Kamera tidak dapat dibuka. Tutup aplikasi lain yang sedang memakai kamera, lalu coba lagi.',
      );
      setState('idle');
    }
  };

  const closeCamera = () => {
    stopCamera();
    setState('idle');
  };

  const capture = async () => {
    const video = videoRef.current;
    if (!video) return;
    setProcessing(true);
    try {
      const photo = await videoToWatermarked(video, getWatermarkLines());
      closeCamera();
      onChange(photo);
    } catch {
      setMessage('Gagal mengambil foto, silakan coba lagi.');
    } finally {
      setProcessing(false);
    }
  };

  const retake = () => {
    onChange(null);
    void startCamera();
  };

  const showCamera = state !== 'idle' && !preview;

  return (
    <div className="space-y-3">
      <div
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl ${
          preview || showCamera ? 'bg-gray-900' : 'border-2 border-dashed border-brand-300 bg-brand-50'
        }`}
      >
        {preview && (
          <img src={preview} alt="Foto bukti dengan keterangan" className="h-full w-full object-cover" />
        )}

        {!preview && (
          <video
            ref={videoRef}
            playsInline
            muted
            className={`h-full w-full object-cover ${facing === 'user' ? '-scale-x-100' : ''} ${
              showCamera ? '' : 'hidden'
            }`}
          />
        )}

        {!preview && state === 'starting' && (
          <div className="absolute inset-0 grid place-items-center text-sm text-white">
            Membuka kamera...
          </div>
        )}

        {!preview && state === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <Camera size={40} className="text-brand-500" />
            {supported ? (
              <>
                <div>
                  <p className="font-semibold text-brand-700">Ambil foto bukti WFH</p>
                  <p className="text-sm text-brand-600">
                    Jam, tanggal, dan lokasi tercetak otomatis di foto
                  </p>
                </div>
                <Button type="button" onClick={() => void startCamera()} disabled={disabled}>
                  {disabled ? 'Menunggu lokasi...' : 'Buka Kamera'}
                </Button>
              </>
            ) : (
              <p className="text-sm text-brand-700">
                Kamera tidak dapat diakses di browser ini. Pastikan aplikasi dibuka melalui HTTPS
                dan gunakan browser terbaru seperti Chrome atau Safari.
              </p>
            )}
          </div>
        )}

        {processing && (
          <div className="absolute inset-0 grid place-items-center bg-black/50 text-sm font-medium text-white">
            Memproses foto...
          </div>
        )}
      </div>

      {message && <p className="text-sm text-amber-700">{message}</p>}

      {state === 'live' && !preview && (
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => void capture()}
            loading={processing}
            className="flex flex-1 items-center justify-center gap-2"
          >
            <Camera size={18} />
            Ambil Foto
          </Button>
          {canSwitch && (
            <button
              type="button"
              onClick={() => void startCamera(facing === 'user' ? 'environment' : 'user')}
              aria-label="Ganti kamera"
              className="rounded-lg border border-gray-300 px-3 text-gray-700 hover:bg-gray-50"
            >
              <SwitchCamera size={20} />
            </button>
          )}
          <button
            type="button"
            onClick={closeCamera}
            aria-label="Tutup kamera"
            className="rounded-lg border border-gray-300 px-3 text-gray-700 hover:bg-gray-50"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {preview && (
        <Button
          type="button"
          variant="secondary"
          onClick={retake}
          className="flex w-full items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          Foto Ulang
        </Button>
      )}
    </div>
  );
}