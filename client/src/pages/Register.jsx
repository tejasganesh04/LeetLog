import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VIA_LABELS = {
  notion: { name: 'Notion' },
  sheets: { name: 'Google Sheets' },
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const via = params.get('via') || '';
  const integration = VIA_LABELS[via];

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate(via ? `/onboarding?via=${via}` : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }} className="paper-grain">
      <nav style={{ borderBottom: '1px solid var(--rule)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid var(--rule)', objectFit: 'cover' }} />
            <span className="display-italic" style={{ fontSize: 26, color: 'var(--ink)' }}>LeetLog</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.18em', borderLeft: '1px solid var(--rule)', paddingLeft: 10 }}>Vol. I</span>
          </Link>
          <Link to="/login" className="btn-link" style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--ink-muted)', borderColor: 'var(--ink-muted)' }}>
            Already a member? Sign in →
          </Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="eyebrow">Chapter II · The Account</span>
              {integration && (
                <span className="mono" style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600 }}>
                  via {integration.name}
                </span>
              )}
            </div>
            <div className="rule-thick" style={{ marginBottom: 28 }} />
            <h1 className="display" style={{ fontSize: 56, fontWeight: 300, fontVariationSettings: '"opsz" 144, "SOFT" 100', letterSpacing: '-0.035em', lineHeight: 1 }}>
              Begin your<br/>
              <span className="display-italic" style={{ color: 'var(--accent)' }}>revision log.</span>
            </h1>
            <p className="serif" style={{ marginTop: 18, fontSize: 16, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.5 }}>
              A few details, then we set everything up automatically.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="form-group">
              <label>Your name</label>
              <input type="text" placeholder="Ada Lovelace" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Password · 8+ characters</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
            </div>

            {error && <div className="inline-alert inline-alert-error">{error}</div>}

            <button type="submit" className="btn-ink" disabled={loading} style={{ marginTop: 8, justifyContent: 'space-between', padding: '14px 22px' }}>
              <span>{loading ? 'Setting things up…' : 'Create my log'}</span>
              <span className="mono" style={{ fontSize: 12 }}>↵</span>
            </button>
          </form>

          {via && (
            <button onClick={() => navigate('/get-started')} className="btn-link" style={{ marginTop: 32, fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--ink-subtle)', borderColor: 'var(--ink-subtle)' }}>
              ← Change integration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
