import { X } from 'lucide-react';
import type { ReactNode } from 'react';

const tones = {
  error: 'border-brand-100 bg-brand-50 text-brand-700',
  success: 'border-green-200 bg-green-50 text-green-700',
};

interface AlertProps {
  tone?: keyof typeof tones;
  children: ReactNode;
  onClose?: () => void;
}

export function Alert({ tone = 'error', children, onClose }: AlertProps) {
  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}>
      <div>{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Tutup pesan" className="opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      )}
    </div>
  );
}