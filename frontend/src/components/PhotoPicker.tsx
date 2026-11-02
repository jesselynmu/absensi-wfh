import { useEffect, useMemo, useRef } from 'react';

interface PhotoPickerProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

export function PhotoPicker({ file, onChange }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-gray-200">
          <img src={preview} alt="Preview foto bukti" className="h-64 w-full object-cover" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-800 shadow hover:bg-white"
          >
            Ganti foto
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 text-brand-700 transition hover:bg-brand-100"
        >
          <span className="text-4xl">📷</span>
          <span className="font-semibold">Ambil foto bukti WFH</span>
          <span className="text-sm text-brand-600">Format gambar, maksimal 5 MB</span>
        </button>
      )}
    </div>
  );
}