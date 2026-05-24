import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }} className="paper-grain">
      {/* Masthead */}
      <nav style={{ borderBottom: '1px solid var(--rule)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid var(--rule)', objectFit: 'cover' }} />
            <span className="display-italic" style={{ fontSize: 26, color: 'var(--ink)' }}>LeetLog</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.18em', borderLeft: '1px solid var(--rule)', paddingLeft: 10 }}>Vol. I</span>
          </Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ marginBottom: 36 }}>
            <span className="eyebrow">Sign in · Members only</span>
            <div className="rule-thick" style={{ marginTop: 14, marginBottom: 28 }} />
            <h1 className="display" style={{ fontSize: 60, fontWeight: 300, fontVariationSettings: '"opsz" 144, "SOFT" 100', letterSpacing: '-0.035em', lineHeight: 1 }}>
              Welcome<br/>
              <span className="display-italic" style={{ color: 'var(--accent)' }}>back.</span>
            </h1>
            <p className="serif" style={{ marginTop: 18, fontSize: 16, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.5 }}>
              Your revision log is right where you left it.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
              />
            </div>

            {error && (
              <div className="inline-alert inline-alert-error">{error}</div>
            )}

            <button type="submit" className="btn-ink" disabled={loading} style={{ marginTop: 8, justifyContent: 'space-between', padding: '14px 22px' }}>
              <span>{loading ? 'Signing you in…' : 'Sign in'}</span>
              <span className="mono" style={{ fontSize: 12 }}>↵</span>
            </button>
          </form>

          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>No account?</span>
            <span style={{ color: 'var(--rule)' }}>—</span>
            <Link to="/get-started" className="btn-link" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
              Begin a new log →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
