import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';
import type { ChangePasswordResponse } from '../types/auth';

type Field = 'currentPassword' | 'newPassword' | 'confirmPassword';

const emptyForm: Record<Field, string> = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function ChangePasswordPage() {
  const { user, applySession } = useAuth();
  const navigate = useNavigate();
  const isForced = user?.mustChangePassword ?? false;

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field: Field, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errors: Partial<Record<Field, string>> = {};
    if (!form.currentPassword) {
      errors.currentPassword = 'Password lama wajib diisi';
    }
    if (form.newPassword.length < 8) {
      errors.newPassword = 'Password baru minimal 8 karakter';
    } else if (form.newPassword === form.currentPassword) {
      errors.newPassword = 'Password baru harus berbeda dari password lama';
    }
    if (form.confirmPassword !== form.newPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak sama';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!validate()) return;

    setSaving(true);
    try {
      const { data } = await api.post<ChangePasswordResponse>('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      // Simpan token baru yang sudah tidak membawa status wajib ganti password
      applySession(data);

      if (isForced) {
        navigate('/', { replace: true });
        return;
      }

      setSuccess('Password berhasil diubah. Gunakan password baru saat login berikutnya.');
      setForm(emptyForm);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ganti Password"
        description={
          isForced
            ? 'Buat password baru sebelum mulai menggunakan aplikasi.'
            : 'Perbarui password akun Anda secara berkala.'
        }
      />

      {isForced && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <ShieldAlert size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Anda wajib mengganti password</p>
            <p className="mt-1 text-sm">
              Akun Anda masih memakai password sementara dari HRD. Masukkan password tersebut
              sebagai password lama, lalu buat password baru milik Anda sendiri.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form
          className="space-y-5 rounded-xl bg-white p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <PasswordField
            label="Password Lama"
            name="currentPassword"
            value={form.currentPassword}
            onChange={(e) => update('currentPassword', e.target.value)}
            error={fieldErrors.currentPassword}
            autoComplete="current-password"
          />
          <PasswordField
            label="Password Baru"
            name="newPassword"
            value={form.newPassword}
            onChange={(e) => update('newPassword', e.target.value)}
            error={fieldErrors.newPassword}
            autoComplete="new-password"
          />
          <PasswordField
            label="Konfirmasi Password Baru"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
          />

          {success && (
            <Alert tone="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
          {error && <Alert>{error}</Alert>}

          <div className="flex justify-end">
            <Button type="submit" loading={saving} className="w-full sm:w-auto">
              Simpan Password
            </Button>
          </div>
        </form>

        <aside className="h-fit rounded-xl border border-brand-100 bg-brand-50 p-5">
          <div className="mb-3 flex items-center gap-2 font-semibold text-brand-700">
            <ShieldCheck size={20} />
            Tips password aman
          </div>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-brand-700">
            <li>Minimal 8 karakter.</li>
            <li>Gabungkan huruf besar, huruf kecil, dan angka.</li>
            <li>Jangan pakai tanggal lahir atau nama sendiri.</li>
            <li>Segera ganti password sementara yang diberikan HRD.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}