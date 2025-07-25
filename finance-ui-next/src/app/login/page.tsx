'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { login } = useAuth();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'login') {
        const { data } = await api.post('/auth/login', {
          email,
          password: pw,
        }); 
        login(data.accessToken);
      } else {
        const { data } = await api.post('/auth/register', {
          email,
          password: pw,
        });
        login(data.accessToken);
      }
      router.push('/dashboard');
    } catch (err: any) {
      if (
        mode === 'register' &&
        err.response?.status === 409 &&
        err.response?.data?.message === 'email_exists'
      ) {
        setError('E-mail already registered — please log in instead.');
        setMode('login');
      } else if (err.response?.status === 401) {
        setError('Invalid credentials.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={submit}
        className="w-80 rounded-lg bg-white p-8 shadow"
      >
        <h1 className="mb-6 text-center text-2xl font-bold">
          {mode === 'login' ? 'Login' : 'Register'}
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full rounded border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded border p-2"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        {error && (
          <p className="mb-4 text-center text-red-600">{error}</p>
        )}

        <button
          className="mb-3 w-full rounded bg-blue-600 py-2 font-semibold text-white"
          type="submit"
        >
          {mode === 'login' ? 'Log In' : 'Register'}
        </button>

        <p className="text-center text-sm">
          {mode === 'login' ? (
            <>
              No account yet?{' '}
              <button
                type="button"
                className="text-blue-600 underline"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button
                type="button"
                className="text-blue-600 underline"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
