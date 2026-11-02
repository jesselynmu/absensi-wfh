import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
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
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6 shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          void handleLogin();
        }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Absensi WFH</h1>
          <p className="text-gray-500">Masuk untuk melakukan absensi</p>
        </div>

        <TextField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</div>
        )}

        <Button type="submit" loading={loading}>Masuk</Button>
      </form>
    </div>
  );
}