import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

// ── Step progress bar ─────────────────────────────────────────────────────────

const StepBar = ({ labels, current }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 56 }}>
    {labels.map((label, i) => {
      const n = i + 1;
      const done = n < current;
      const active = n === current;
      return (
        <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < labels.length - 1 ? '1' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: done ? 'var(--accent)' : active ? 'var(--ink)' : 'transparent',
              border: done || active ? 'none' : '1.5px solid var(--rule)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: done || active ? 'var(--paper)' : 'var(--ink-subtle)',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              transition: 'all 0.25s',
            }}>
              {done ? '✓' : n}
            </div>
            <span className="mono" style={{
              fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em',
              color: active ? 'var(--ink)' : done ? 'var(--ink-muted)' : 'var(--ink-subtle)',
              fontWeight: active ? 700 : 400,
              whiteSpace: 'nowrap',
            }}>{label}</span>
          </div>
          {i < labels.length - 1 && (
            <div style={{ flex: 1, height: 1, background: 'var(--rule)', margin: '0 14px' }} />
          )}
        </div>
      );
    })}
  </div>
);

// ── Notion database picker ────────────────────────────────────────────────────

function DbPicker({ onDone }) {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.getNotionDatabases()
      .then(res => setDatabases(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pick = async (db) => {
    setSaving(true);
    try {
      await api.saveNotionDatabase({ databaseId: db.id, databaseName: db.name, enabled: true });
      onDone();
    } catch (err) {
      setMsg(err.message || 'Failed to save — try again');
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-muted)', padding: '24px 0' }}>
      <span className="spinner" />
      <span className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Loading databases…</span>
    </div>
  );

  if (databases.length === 0) return (
    <div style={{ border: '1px solid var(--rule)', padding: '28px 24px' }}>
      <p className="mono" style={{ fontSize: 11, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
        No databases found
      </p>
      <p className="serif" style={{ fontSize: 14, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.65 }}>
        Go to Notion, create a database, then re-authorize LeetLog and share that database during the prompt.
      </p>
    </div>
  );

  return (
    <div>
      <div style={{ borderTop: '1px solid var(--rule)' }}>
        {databases.map(db => (
          <button
            key={db.id}
            onClick={() => pick(db)}
            disabled={saving}
            style={{
              width: '100%', textAlign: 'left', background: 'transparent',
              borderBottom: '1px solid var(--rule)', borderLeft: 'none', borderRight: 'none', borderTop: 'none',
              padding: '16px 12px', fontSize: 17,
              fontFamily: 'var(--font-serif)', fontWeight: 500, color: 'var(--ink)',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = 'var(--paper-soft)'; e.currentTarget.style.paddingLeft = '20px'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '12px'; }}
          >
            <span>{db.name}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--ink-subtle)' }}>→</span>
          </button>
        ))}
      </div>
      {msg && <div className="inline-alert inline-alert-error" style={{ marginTop: 16, display: 'inline-block' }}>{msg}</div>}
    </div>
  );
}

// ── Google Sheets setup ───────────────────────────────────────────────────────

function SheetsSetup({ onDone }) {
  const [serviceEmail, setServiceEmail] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.getSheetsConfig()
      .then(res => setServiceEmail(res.data?.serviceAccountEmail || ''))
      .catch(() => {});
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText(serviceEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!sheetUrl) return;
    setSaving(true);
    setMsg(null);
    try {
      await api.saveGoogleSheets({ sheetUrl, enabled: true });
      onDone();
    } catch (err) {
      setMsg(err.message || 'Failed to save');
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* A: share email */}
      <div>
        <p className="label" style={{ marginBottom: 14 }}>01 · Share your sheet with this address</p>
        {serviceEmail ? (
          <div style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)', padding: '16px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="mono" style={{ fontSize: 13, color: 'var(--ink)', flex: 1, wordBreak: 'break-all' }}>{serviceEmail}</span>
            <button onClick={copyEmail} className="btn-link" style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.14em', flexShrink: 0 }}>
              {emailCopied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        ) : (
          <span className="spinner" />
        )}
        <p className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 10 }}>
          Open your sheet → Share → paste this address → set to <span style={{ color: 'var(--ink)' }}>Editor</span>
        </p>
      </div>

      {/* B: paste URL */}
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="form-group">
          <label>02 · Paste your sheet URL</label>
          <input
            type="url"
            placeholder="https://docs.google.com/spreadsheets/d/…"
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
            required
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button type="submit" disabled={saving || !sheetUrl} className="btn-ink" style={{ padding: '12px 22px', fontSize: 13 }}>
            {saving ? 'Connecting…' : 'Connect Sheets →'}
          </button>
          {msg && <div className="inline-alert inline-alert-error" style={{ display: 'inline-block' }}>{msg}</div>}
        </div>
      </form>
    </div>
  );
}

// ── Extension step ────────────────────────────────────────────────────────────

function ExtensionStep({ onDone }) {
  const STEPS_TEXT = [
    'Open the Chrome Web Store link below.',
    'Click "Add to Chrome" and confirm.',
    'Pin the extension — click the puzzle icon in Chrome\'s toolbar.',
    'Open the popup and sign in with your LeetLog account.',
  ];

  return (
    <div>
      <div style={{ borderTop: '1px solid var(--rule)', marginBottom: 32 }}>
        {STEPS_TEXT.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '14px 0', borderBottom: i < STEPS_TEXT.length - 1 ? '1px solid var(--rule-soft)' : 'none' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, minWidth: 24 }}>0{i + 1}</span>
            <span className="serif" style={{ fontSize: 15, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.6 }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <a
          href="https://chrome.google.com/webstore"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ink"
          style={{ padding: '12px 22px', fontSize: 13, textDecoration: 'none', display: 'inline-flex' }}
        >
          Open Chrome Web Store ↗
        </a>
        <button onClick={onDone} className="btn-ghost" style={{ padding: '10px 18px', fontSize: 12 }}>
          I'll install it later →
        </button>
      </div>
      <div style={{ borderTop: '1px solid var(--rule)', marginTop: 28, paddingTop: 20 }}>
        <button onClick={onDone} className="btn-link" style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          Done — take me to my dashboard →
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const NOTION_LABELS = ['Welcome', 'Connect', 'Database', 'Extension'];
const SHEETS_LABELS = ['Welcome', 'Sheets', 'Extension'];

export default function Onboarding() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const via = params.get('via') || 'notion';
  const notionJustConnected = params.get('notion') === 'connected';
  const isNotion = via === 'notion';
  const labels = isNotion ? NOTION_LABELS : SHEETS_LABELS;

  // If returning from Notion OAuth, jump straight to DB picker (step 3)
  const [step, setStep] = useState(notionJustConnected ? 3 : 1);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (notionJustConnected) {
      window.history.replaceState({}, '', `/onboarding?via=${via}`);
    }
  }, []);

  const next = () => setStep(s => s + 1);

  const connectNotion = async () => {
    setConnecting(true);
    localStorage.setItem('ll_onboard', JSON.stringify({ via: 'notion' }));
    try {
      const res = await api.getNotionAuthUrl();
      window.location.href = res.data.url;
    } catch {
      localStorage.removeItem('ll_onboard');
      setConnecting(false);
    }
  };

  // Determine which content to show
  const isExtensionStep = (isNotion && step === 4) || (!isNotion && step === 3);

  return (
    <div className="paper-grain" style={{ maxWidth: 660, margin: '0 auto', padding: '56px 32px 96px' }}>
      <StepBar labels={labels} current={step} />

      {/* ── Step 1: Welcome ── */}
      {step === 1 && (
        <div>
          <span className="eyebrow">Step 1 of {labels.length} · Getting started</span>
          <div className="rule-thick" style={{ marginTop: 14, marginBottom: 28 }} />
          <h1 className="display-italic" style={{ fontSize: 54, color: 'var(--accent)', lineHeight: 1, marginBottom: 22 }}>
            Welcome to LeetLog.
          </h1>
          <p className="serif" style={{ fontSize: 18, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 40, maxWidth: 500 }}>
            {isNotion
              ? 'You\'re a few steps from a practice log that actually keeps up with you. First, connect Notion — then install the extension and you\'re done.'
              : 'You\'re a few steps from a practice log that actually keeps up with you. First, connect Google Sheets — then install the extension and you\'re done.'
            }
          </p>
          <button onClick={next} className="btn-ink" style={{ padding: '13px 26px', fontSize: 13 }}>
            Let's go →
          </button>
        </div>
      )}

      {/* ── Step 2 Notion: Connect ── */}
      {isNotion && step === 2 && (
        <div>
          <span className="eyebrow">Step 2 of {labels.length} · Notion</span>
          <div className="rule-thick" style={{ marginTop: 14, marginBottom: 28 }} />
          <h2 className="display" style={{ fontSize: 46, fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 18 }}>
            Connect Notion
          </h2>
          <p className="serif" style={{ fontSize: 16, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 12, maxWidth: 500 }}>
            You'll be taken to Notion to authorize LeetLog. During the prompt, share the database you want to sync problems into.
          </p>
          <p className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 36, lineHeight: 1.7 }}>
            Tip · Create a blank full-page database in Notion first,<br />then share it with the integration when prompted.
          </p>
          <button onClick={connectNotion} disabled={connecting} className="btn-ink" style={{ padding: '13px 26px', fontSize: 13 }}>
            {connecting ? 'Redirecting to Notion…' : 'Connect Notion →'}
          </button>
        </div>
      )}

      {/* ── Step 2 Sheets: Setup ── */}
      {!isNotion && step === 2 && (
        <div>
          <span className="eyebrow">Step 2 of {labels.length} · Google Sheets</span>
          <div className="rule-thick" style={{ marginTop: 14, marginBottom: 28 }} />
          <h2 className="display" style={{ fontSize: 46, fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 18 }}>
            Connect Google Sheets
          </h2>
          <p className="serif" style={{ fontSize: 16, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 36, maxWidth: 500 }}>
            LeetLog uses a service account to write to your sheet. Just share your sheet with it and paste the URL below.
          </p>
          <SheetsSetup onDone={next} />
        </div>
      )}

      {/* ── Step 3 Notion: Pick database ── */}
      {isNotion && step === 3 && (
        <div>
          <span className="eyebrow">Step 3 of {labels.length} · Notion</span>
          <div className="rule-thick" style={{ marginTop: 14, marginBottom: 28 }} />
          <h2 className="display" style={{ fontSize: 46, fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 18 }}>
            Pick a database
          </h2>
          <p className="serif" style={{ fontSize: 16, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 32, maxWidth: 500 }}>
            Choose where LeetLog should file your problems. Each solved problem becomes a page in this database.
          </p>
          <DbPicker onDone={next} />
        </div>
      )}

      {/* ── Extension step (Notion: step 4, Sheets: step 3) ── */}
      {isExtensionStep && (
        <div>
          <span className="eyebrow">Step {isNotion ? 4 : 3} of {labels.length} · Chrome Extension</span>
          <div className="rule-thick" style={{ marginTop: 14, marginBottom: 28 }} />
          <h2 className="display" style={{ fontSize: 46, fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 18 }}>
            Install the extension
          </h2>
          <p className="serif" style={{ fontSize: 16, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 36, maxWidth: 500 }}>
            The LeetLog Chrome extension silently watches your LeetCode sessions — every run, submission, and minute. No manual logging ever.
          </p>
          <ExtensionStep onDone={() => navigate('/dashboard')} />
        </div>
      )}
    </div>
  );
}
