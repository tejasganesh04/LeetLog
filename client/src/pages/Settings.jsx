import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// ── Editorial Section ─────────────────────────────────────────────────────────

const Section = ({ chapter, title, subtitle, children }) => (
  <section style={{ marginBottom: 72 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
      <span className="eyebrow">{chapter}</span>
    </div>
    <div className="rule-thick" style={{ marginBottom: 24 }} />
    <h2 className="display" style={{ fontSize: 40, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 80', letterSpacing: '-0.025em', lineHeight: 1, marginBottom: 10 }}>
      {title}
    </h2>
    {subtitle && (
      <p className="serif" style={{ fontSize: 15, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 28, maxWidth: 520 }}>
        {subtitle}
      </p>
    )}
    {children}
  </section>
);

// ── Buttons ───────────────────────────────────────────────────────────────────

const Btn = ({ onClick, disabled, children, variant = 'default' }) => {
  if (variant === 'orange') {
    return (
      <button onClick={onClick} disabled={disabled} className="btn-ink" style={{ padding: '11px 20px' }}>
        {children}
      </button>
    );
  }
  if (variant === 'danger') {
    return (
      <button onClick={onClick} disabled={disabled} className="btn-link" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600 }}>
        {children}
      </button>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }}>
      {children}
    </button>
  );
};

// ── Notion section ────────────────────────────────────────────────────────────

function NotionSection() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const justConnected = params.get('notion') === 'connected';

  const [state, setState] = useState('loading');
  const [workspaceName, setWorkspaceName] = useState('');
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null);
  const [notionEnabled, setNotionEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const loadIntegration = useCallback(async () => {
    try {
      const res = await api.getIntegration();
      const n = res.data?.notion;
      if (n?.accessToken) {
        setWorkspaceName(n.workspaceName || '');
        setNotionEnabled(n.enabled ?? true);
        if (n.databaseId) {
          setSelectedDb({ id: n.databaseId, name: n.databaseName || 'Selected database' });
          setState('connected');
        } else {
          setState('picking');
          loadDatabases();
        }
      } else {
        setState('disconnected');
      }
    } catch {
      setState('disconnected');
    }
  }, []);

  const loadDatabases = async () => {
    try {
      const res = await api.getNotionDatabases();
      setDatabases(res.data || []);
    } catch {
      setDatabases([]);
    }
  };

  useEffect(() => { loadIntegration(); }, [loadIntegration]);

  useEffect(() => {
    if (justConnected) {
      const onboard = localStorage.getItem('ll_onboard');
      if (onboard) {
        localStorage.removeItem('ll_onboard');
        const { via } = JSON.parse(onboard);
        navigate(`/onboarding?via=${via}&notion=connected`);
        return;
      }
      loadIntegration();
      window.history.replaceState({}, '', '/settings');
    }
  }, [justConnected, navigate]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await api.getNotionAuthUrl();
      window.location.href = res.data.url;
    } catch (err) {
      setMsg({ text: err.message || 'Could not start Notion auth', type: 'error' });
      setConnecting(false);
    }
  };

  const handlePickDatabase = async (db) => {
    setSaving(true);
    try {
      await api.saveNotionDatabase({ databaseId: db.id, databaseName: db.name, enabled: true });
      setSelectedDb(db);
      setNotionEnabled(true);
      setState('connected');
      setMsg({ text: `Syncing to "${db.name}"`, type: 'success' });
    } catch (err) {
      setMsg({ text: err.message || 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  const handleToggleEnabled = async (enabled) => {
    setNotionEnabled(enabled);
    try {
      await api.saveNotionDatabase({ databaseId: selectedDb.id, databaseName: selectedDb.name, enabled });
    } catch {}
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Notion? Auto-sync will stop.')) return;
    try {
      await api.disconnectNotion();
      setState('disconnected');
      setWorkspaceName('');
      setSelectedDb(null);
      setDatabases([]);
    } catch (err) {
      setMsg({ text: err.message || 'Failed to disconnect', type: 'error' });
    }
  };

  const handleChangeDatabase = () => {
    setState('picking');
    loadDatabases();
  };

  if (state === 'loading') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-muted)', padding: '8px 0' }}>
      <span className="spinner" />
      <span className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em' }}>Loading…</span>
    </div>
  );

  if (state === 'disconnected') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      <p className="serif" style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.6, fontStyle: 'italic', maxWidth: 540 }}>
        Connect your Notion workspace — every saved problem will sync as a page in a database of your choosing.
      </p>
      <Btn onClick={handleConnect} disabled={connecting} variant="orange">
        {connecting ? 'Redirecting…' : 'Connect Notion →'}
      </Btn>
      {msg && <div className={`inline-alert inline-alert-${msg.type}`}>{msg.text}</div>}
    </div>
  );

  if (state === 'picking') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />
        <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          {workspaceName || 'Notion'} connected
        </span>
      </div>
      <p className="serif" style={{ fontSize: 14, color: 'var(--ink-soft)', fontStyle: 'italic', marginBottom: 18 }}>
        Choose which database to sync your problems to:
      </p>
      {databases.length === 0 ? (
        <div style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)', padding: '20px 0' }}>
          <p className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            No databases found · Share one with LeetLog during authorization.
          </p>
        </div>
      ) : (
        <div style={{ borderTop: '1px solid var(--rule)' }}>
          {databases.map(db => (
            <button
              key={db.id}
              onClick={() => handlePickDatabase(db)}
              disabled={saving}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                borderBottom: '1px solid var(--rule)',
                borderLeft: 'none', borderRight: 'none', borderTop: 'none',
                padding: '16px 12px',
                fontSize: 15,
                fontFamily: 'var(--font-serif)',
                fontWeight: 500,
                color: 'var(--ink)',
                cursor: 'pointer',
                opacity: saving ? 0.5 : 1,
                transition: 'all 0.18s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = 'var(--paper-soft)'; e.currentTarget.style.paddingLeft = '20px'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '12px'; }}
            >
              <span>{db.name}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-subtle)' }}>→</span>
            </button>
          ))}
        </div>
      )}
      {msg && <div className={`inline-alert inline-alert-${msg.type}`} style={{ marginTop: 16, display: 'inline-block' }}>{msg.text}</div>}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />
        <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          {workspaceName || 'Notion'} connected
        </span>
      </div>

      <div style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)', padding: '20px 0', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <p className="label" style={{ marginBottom: 6 }}>Syncing to</p>
          <p className="serif" style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{selectedDb?.name}</p>
        </div>
        <button onClick={handleChangeDatabase} className="btn-link" style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-muted)', borderColor: 'var(--ink-muted)' }}>
          Change database
        </button>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer', fontWeight: 500, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        <input type="checkbox" checked={notionEnabled} onChange={e => handleToggleEnabled(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)', border: 'none', padding: 0 }} />
        Auto-sync enabled
      </label>

      {msg && <div className={`inline-alert inline-alert-${msg.type}`} style={{ display: 'inline-block' }}>{msg.text}</div>}

      <Btn onClick={handleDisconnect} variant="danger">
        Disconnect Notion
      </Btn>
    </div>
  );
}

// ── Main Settings ─────────────────────────────────────────────────────────────

export default function Settings() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetsEnabled, setSheetsEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [serviceEmail, setServiceEmail] = useState('');

  useEffect(() => {
    api.getSheetsConfig().then(res => setServiceEmail(res.data?.serviceAccountEmail || '')).catch(() => {});
    api.getIntegration().then(res => {
      const gs = res.data?.googleSheets;
      if (gs?.sheetUrl) setSheetUrl(gs.sheetUrl);
      if (gs?.enabled !== undefined) setSheetsEnabled(gs.enabled);
    }).catch(() => {});
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText(serviceEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      await api.saveGoogleSheets({ sheetUrl, enabled: sheetsEnabled });
      setSaveMsg({ text: 'Settings saved', type: 'success' });
    } catch (err) {
      setSaveMsg({ text: err.message || 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  };

  return (
    <div className="paper-grain" style={{ maxWidth: 720, margin: '0 auto', padding: '56px 32px 80px' }}>

      {/* Masthead */}
      <div style={{ marginBottom: 64 }}>
        <span className="eyebrow">Volume Settings · Connections & sync</span>
        <div className="rule-thick" style={{ marginTop: 14, marginBottom: 24 }} />
        <h1 className="display" style={{ fontSize: 72, fontWeight: 300, fontVariationSettings: '"opsz" 144, "SOFT" 100', letterSpacing: '-0.04em', lineHeight: 0.95 }}>
          <span className="display-italic" style={{ color: 'var(--accent)' }}>Settings.</span>
        </h1>
      </div>

      <Section chapter="§ 1 · Notion" title="Notion Sync" subtitle="Every saved problem creates or updates a page in your Notion database. Notes, approach, tags, all in one place.">
        <NotionSection />
      </Section>

      <Section chapter="§ 2 · Google Sheets" title="Google Sheets Sync" subtitle="One row per problem, updated in place after every save. Filter, share, or pipe it elsewhere.">
        {serviceEmail && (
          <div style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)', padding: '20px 0', marginBottom: 28 }}>
            <p className="label" style={{ marginBottom: 12 }}>Share your sheet with this email</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <input value={serviceEmail} readOnly style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)', borderBottom: 'none', padding: 0 }} />
              <button onClick={copyEmail} className="btn-link" style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.14em', flexShrink: 0 }}>
                {emailCopied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <p className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 10 }}>
              Give it <span style={{ color: 'var(--ink)' }}>Editor</span> access
            </p>
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          <p className="label" style={{ marginBottom: 12 }}>Setup guide</p>
          <ol style={{ listStyle: 'none', counterReset: 'step' }}>
            {[
              'Create a new Google Sheet.',
              'Click Share → paste the email above → set role to Editor.',
              'Copy the sheet URL and paste below.',
              'Enable sync and save.',
            ].map((step, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--rule-soft)' : 'none' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, minWidth: 24 }}>0{i + 1}</span>
                <span className="serif" style={{ fontSize: 14, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.5 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-group">
            <label>Google Sheet URL</label>
            <input type="url" placeholder="https://docs.google.com/spreadsheets/d/…" value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} required />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer', fontWeight: 500, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            <input type="checkbox" checked={sheetsEnabled} onChange={e => setSheetsEnabled(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)', border: 'none', padding: 0 }} />
            Auto-sync enabled
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
            <Btn disabled={saving} variant="orange">{saving ? 'Saving…' : 'Save settings →'}</Btn>
            {saveMsg && <div className={`inline-alert inline-alert-${saveMsg.type}`}>{saveMsg.text}</div>}
          </div>
        </form>
      </Section>
    </div>
  );
}
