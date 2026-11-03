import { useState } from 'react';
import { api, getErrorMessage } from '../../api/client';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';
import type { Employee } from '../../types/employee';

interface EmployeeFormModalProps {
  employee: Employee | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

const toNullable = (value: string) => (value.trim() === '' ? null : value.trim());

export function EmployeeFormModal({ employee, onClose, onSaved }: EmployeeFormModalProps) {
  const { user } = useAuth();
  const isEdit = employee !== null;
  const isSelf = isEdit && employee.id === user?.employeeId;

  const [form, setForm] = useState({
    employeeCode: employee?.employeeCode ?? '',
    fullName: employee?.fullName ?? '',
    email: employee?.email ?? '',
    phone: employee?.phone ?? '',
    department: employee?.department ?? '',
    position: employee?.position ?? '',
    joinDate: employee?.joinDate ?? '',
    role: (employee?.role ?? 'EMPLOYEE') as UserRole,
    isActive: employee?.isActive ?? true,
    password: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError('');
    setSaving(true);

    const payload = {
      employeeCode: form.employeeCode.trim(),
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
        await api.patch(`/employees/${employee.id}`, {
          ...payload,
          isActive: form.isActive,
          ...(form.password ? { password: form.password } : {}),
        });
        onSaved('Data karyawan berhasil diperbarui');
      } else {
        await api.post('/employees', { ...payload, password: form.password });
        onSaved('Karyawan baru berhasil ditambahkan beserta akun login-nya');
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
              value={form.employeeCode}
              onChange={(e) => update('employeeCode', e.target.value)}
              placeholder="EMP002"
              maxLength={20}
              required
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
            <TextField
              label={isEdit ? 'Password Baru' : 'Password Awal'}
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
              minLength={6}
              required={!isEdit}
              autoComplete="new-password"
            />
          </div>
          {isSelf && (
            <p className="mt-2 text-xs text-gray-500">
              Role dan status akun Anda sendiri tidak dapat diubah.
            </p>
          )}
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