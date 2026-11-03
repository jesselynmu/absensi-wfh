import { KeyRound, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../api/client';
import { Alert } from '../../components/Alert';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { CredentialsModal } from '../../components/CredentialsModal';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import type { Credentials, Employee } from '../../types/employee';
import { EmployeeFormModal } from './EmployeeFormModal';

export function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [resetting, setResetting] = useState<Employee | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [credentials, setCredentials] = useState<{ title: string; data: Credentials } | null>(null);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Employee[]>('/employees', {
        params: {
          search: search.trim() || undefined,
          status: status === 'all' ? undefined : status,
        },
      });
      setEmployees(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(() => void loadEmployees(), 300);
    return () => clearTimeout(timer);
  }, [loadEmployees]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEditing(employee);
    setFormOpen(true);
  };

  const closeForm = useCallback(() => setFormOpen(false), []);

  const handleSaved = (message: string, newCredentials?: Credentials) => {
    setFormOpen(false);
    setSuccess(message);
    if (newCredentials) {
      setCredentials({ title: 'Akun Berhasil Dibuat', data: newCredentials });
    }
    void loadEmployees();
  };

  const closeAction = useCallback(() => {
    setDeleting(null);
    setResetting(null);
    setActionError('');
  }, []);

  const handleDelete = async () => {
    if (!deleting) return;
    setActionLoading(true);
    setActionError('');
    try {
      await api.delete(`/employees/${deleting.id}`);
      setSuccess(`${deleting.fullName} berhasil dihapus`);
      setDeleting(null);
      void loadEmployees();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetting) return;
    setActionLoading(true);
    setActionError('');
    try {
      const { data } = await api.post<{ temporaryPassword: string }>(
        `/employees/${resetting.id}/reset-password`,
      );
      setCredentials({
        title: 'Password Berhasil Direset',
        data: {
          fullName: resetting.fullName,
          email: resetting.email,
          password: data.temporaryPassword,
        },
      });
      setResetting(null);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Karyawan"
        description="Kelola data karyawan beserta akun login mereka."
        action={
          <Button onClick={openCreate} className="flex items-center justify-center gap-2">
            <Plus size={18} />
            Tambah Karyawan
          </Button>
        }
      />

      {success && (
        <Alert tone="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && <Alert>{error}</Alert>}

      <section className="rounded-xl bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, kode, atau email..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter status"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="all">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Karyawan</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Departemen / Jabatan</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada karyawan yang cocok.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const isSelf = emp.id === user?.employeeId;
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={emp.fullName} />
                          <div>
                            <p className="font-medium text-gray-900">{emp.fullName}</p>
                            <p className="text-xs text-gray-500">{emp.employeeCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <p>{emp.department ?? '-'}</p>
                        <p className="text-xs text-gray-400">{emp.position ?? ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={emp.role === 'ADMIN' ? 'brand' : 'blue'}>
                          {emp.role === 'ADMIN' ? 'Admin HRD' : 'Karyawan'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={emp.isActive ? 'green' : 'gray'}>
                          {emp.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(emp)}
                            title="Edit data"
                            aria-label={`Edit ${emp.fullName}`}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          >
                            <Pencil size={16} />
                          </button>
                          {!isSelf && (
                            <>
                              <button
                                type="button"
                                onClick={() => setResetting(emp)}
                                title="Reset password"
                                aria-label={`Reset password ${emp.fullName}`}
                                className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                              >
                                <KeyRound size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleting(emp)}
                                title="Hapus"
                                aria-label={`Hapus ${emp.fullName}`}
                                className="rounded-lg p-2 text-gray-500 hover:bg-brand-50 hover:text-brand-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && (
        <EmployeeFormModal employee={editing} onClose={closeForm} onSaved={handleSaved} />
      )}

      {deleting && (
        <Modal title="Hapus Karyawan" onClose={closeAction}>
          <p className="text-gray-600">
            Yakin ingin menghapus{' '}
            <span className="font-semibold text-gray-900">{deleting.fullName}</span>? Akun
            login-nya juga akan ikut terhapus.
          </p>
          {actionError && (
            <div className="mt-4">
              <Alert>{actionError}</Alert>
            </div>
          )}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={closeAction}>
              Batal
            </Button>
            <Button type="button" loading={actionLoading} onClick={() => void handleDelete()}>
              Ya, Hapus
            </Button>
          </div>
        </Modal>
      )}

      {resetting && (
        <Modal title="Reset Password" onClose={closeAction}>
          <p className="text-gray-600">
            Buat password baru untuk{' '}
            <span className="font-semibold text-gray-900">{resetting.fullName}</span>? Password
            lama tidak akan bisa dipakai lagi.
          </p>
          {actionError && (
            <div className="mt-4">
              <Alert>{actionError}</Alert>
            </div>
          )}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={closeAction}>
              Batal
            </Button>
            <Button type="button" loading={actionLoading} onClick={() => void handleReset()}>
              Ya, Reset Password
            </Button>
          </div>
        </Modal>
      )}

      {credentials && (
        <CredentialsModal
          title={credentials.title}
          credentials={credentials.data}
          onClose={() => setCredentials(null)}
        />
      )}
    </div>
  );
}