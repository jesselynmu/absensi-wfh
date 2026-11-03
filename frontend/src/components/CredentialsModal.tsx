import { Check, Copy, KeyRound } from 'lucide-react';
import { useState } from 'react';
import type { Credentials } from '../types/employee';
import { Button } from './Button';
import { Modal } from './Modal';

interface CredentialsModalProps {
  title: string;
  credentials: Credentials;
  onClose: () => void;
}

export function CredentialsModal({ title, credentials, onClose }: CredentialsModalProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(
      `Email: ${credentials.email}\nPassword: ${credentials.password}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-gray-600">
          Berikan informasi login ini kepada{' '}
          <span className="font-semibold text-gray-900">{credentials.fullName}</span>.
        </p>

        <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</p>
            <p className="font-medium text-gray-900">{credentials.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Password sementara
            </p>
            <p className="flex items-center gap-2 font-mono text-lg font-semibold tracking-wider text-gray-900">
              <KeyRound size={18} className="text-brand-500" />
              {credentials.password}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          Password ini hanya ditampilkan sekali. Simpan atau salin sekarang sebelum menutup jendela ini.
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Selesai
          </Button>
          <Button
            type="button"
            onClick={() => void copy()}
            className="flex items-center justify-center gap-2"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Tersalin' : 'Salin Info Login'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}