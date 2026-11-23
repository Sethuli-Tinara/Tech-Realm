import { useState } from 'react';
import { api } from '../api.js';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('register'); // 'register' or 'login'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const path = mode === 'register' ? '/auth/register' : '/auth/login';
      const data = await api(path, { method: 'POST', body: form });
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <form className="panel" onSubmit={submit}>
        <h2>{mode === 'register' ? 'Create your squire account' : 'Welcome back, knight'}</h2>

        {mode === 'register' && (
          <label>
            Name
            <input name="name" value={form.name} onChange={update} required />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={update} required />
        </label>
        <label>
          Password (8+ characters)
          <input name="password" type="password" minLength={8} value={form.password} onChange={update} required />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Log in'}
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
        >
          {mode === 'register' ? 'I already have an account' : 'I need a new account'}
        </button>
      </form>
    </main>
  );
}
