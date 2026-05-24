import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  const links = [
    { to: '/dashboard', label: 'The Log' },
    { to: '/settings',  label: 'Settings' },
  ];

  return (
    <nav style={{
      background: 'var(--paper)',
      borderBottom: '1px solid var(--rule)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: '0 32px',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}>
        {/* Masthead */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid var(--rule)', objectFit: 'cover' }} />
          <span className="display-italic" style={{ fontSize: 26, color: 'var(--ink)' }}>
            LeetLog
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.18em', borderLeft: '1px solid var(--rule)', paddingLeft: 10 }}>
            Vol. I
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: isActive(to) ? 'var(--ink)' : 'var(--ink-muted)',
                textDecoration: 'none',
                padding: '4px 0',
                borderBottom: isActive(to) ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.color = 'var(--ink)'; }}
              onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.color = 'var(--ink-muted)'; }}
            >
              {label}
            </Link>
          ))}

          <span style={{ color: 'var(--rule)', fontSize: 14 }}>·</span>

          {user?.email && (
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-subtle)', letterSpacing: '-0.01em' }}>
              {user.email}
            </span>
          )}

          <button
            onClick={handleLogout}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              background: 'transparent',
              color: 'var(--ink-muted)',
              border: 'none',
              padding: '4px 0',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-muted)'}
          >
            Sign out →
          </button>
        </div>
      </div>
    </nav>
  );
}
