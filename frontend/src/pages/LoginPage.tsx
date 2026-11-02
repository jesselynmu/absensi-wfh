import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import loginIllustration from '../assets/VectorLogin.png';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Ilustrasi: di atas pada HP, di kiri pada desktop */}
      <div className="flex items-center justify-center bg-[#f5f5f5] px-6 py-8 lg:w-1/2 lg:py-0">
        <img
          src={loginIllustration}
          alt="Ilustrasi login aman"
          className="w-full max-w-[220px] sm:max-w-xs lg:max-w-lg"
        />
      </div>

      {/* Form login */}
      <div className="flex flex-1 items-center justify-center px-6 py-10 lg:w-1/2">
        <form
          className="flex w-full max-w-sm flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
          }}
        >
          <div>
            <span className="mb-3 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              Absensi WFH
            </span>
            <h1 className="text-3xl font-bold text-gray-900">Selamat datang</h1>
            <p className="mt-1 text-gray-500">
              Masuk dengan akun kantor untuk melakukan absensi.
            </p>
          </div>

          <TextField
            label="Email"
            name="email"
            type="email"
            placeholder="nama@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2.5 text-sm text-brand-700">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Masuk
          </Button>

          <p className="text-center text-sm text-gray-500">
            Lupa password? Hubungi admin HRD.
          </p>
        </form>
      </div>
    </div>
  );
}