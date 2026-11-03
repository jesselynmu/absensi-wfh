import { useState } from 'react';
import { api, getErrorMessage } from '../../api/client';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';
import type { Credentials, Employee } from '../../types/employee';

interface EmployeeFormModalProps {
  employee: Employee | null;
  onClose: () => void;
  onSaved: (message: string, credentials?: Credentials) => void;
}

const toNullable = (value: string) => (value.trim() === '' ? null : value.trim());

export function EmployeeFormModal({ employee, onClose, onSaved }: EmployeeFormModalProps) {
  const { user } = useAuth();
  const isEdit = employee !== null;
  const isSelf = isEdit && employee.id === user?.employeeId;

  const [form, setForm] = useState({
    fullName: employee?.fullName ?? '',
    email: employee?.email ?? '',
    phone: employee?.phone ?? '',
    department: employee?.department ?? '',
    position: employee?.position ?? '',
    joinDate: employee?.joinDate ?? '',
    role: (employee?.role ?? 'EMPLOYEE') as UserRole,
    isActive: employee?.isActive ?? true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError('');
    setSaving(true);

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: toNullable(form.phone),
      department: toNullable(form.department),
      position: toNullable(form.position),
      joinDate: form.joinDate || null,
      role: form.role,
    };

    try {
      if (isEdit) {
        await api.patch(`/employees/${employee.id}`, { ...payload, isActive: form.isActive });
        onSaved('Data karyawan berhasil diperbarui');
      } else {
        const { data } = await api.post<Employee & { temporaryPassword: string }>(
          '/employees',
          payload,
        );
        onSaved(`${data.fullName} (${data.employeeCode}) berhasil ditambahkan`, {
          fullName: data.fullName,
          email: data.email,
          password: data.temporaryPassword,
        });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Data Karyawan' : 'Tambah Karyawan'} onClose={onClose} size="lg">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Data Karyawan
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Kode Karyawan"
              name="employeeCode"
              value={employee?.employeeCode ?? ''}
              placeholder="Dibuat otomatis oleh sistem"
              disabled
            />
            <TextField
              label="Nama Lengkap"
              name="fullName"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              maxLength={100}
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
            <TextField
              label="No. Telepon"
              name="phone"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="08xxxxxxxxxx"
              maxLength={20}
            />
            <TextField
              label="Departemen"
              name="department"
              value={form.department}
              onChange={(e) => update('department', e.target.value)}
              placeholder="Finance"
              maxLength={50}
            />
            <TextField
              label="Jabatan"
              name="position"
              value={form.position}
              onChange={(e) => update('position', e.target.value)}
              placeholder="Staff"
              maxLength={50}
            />
            <TextField
              label="Tanggal Bergabung"
              name="joinDate"
              type="date"
              value={form.joinDate}
              onChange={(e) => update('joinDate', e.target.value)}
            />
            {isEdit && (
              <SelectField
                label="Status"
                name="isActive"
                value={form.isActive ? 'true' : 'false'}
                onChange={(e) => update('isActive', e.target.value === 'true')}
                disabled={isSelf}
                options={[
                  { value: 'true', label: 'Aktif' },
                  { value: 'false', label: 'Nonaktif' },
                ]}
              />
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Akun Login
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Role"
              name="role"
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
              disabled={isSelf}
              options={[
                { value: 'EMPLOYEE', label: 'Karyawan' },
                { value: 'ADMIN', label: 'Admin HRD' },
              ]}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {isSelf
              ? 'Role dan status akun Anda sendiri tidak dapat diubah.'
              : isEdit
                ? 'Untuk mengganti password karyawan, gunakan tombol Reset Password di tabel.'
                : 'Password awal akan dibuat otomatis dan ditampilkan setelah data disimpan.'}
          </p>
        </div>

        {error && <Alert>{error}</Alert>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Karyawan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}