import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const DIFF_CLASS = { Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard' };
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

// ── Editorial section ────────────────────────────────────────────────────────

const Section = ({ num, label, children }) => (
  <section style={{ marginBottom: 56 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
      <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em' }}>§ {num}</span>
      <span className="eyebrow">{label}</span>
    </div>
    <div className="rule" style={{ background: 'var(--ink)', height: 1.5, marginBottom: 22 }} />
    {children}
  </section>
);

// ── Editable field ───────────────────────────────────────────────────────────

const Prose = ({ value, editing, onChange, placeholder }) => {
  if (editing) {
    return (
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        rows={5}
        placeholder={placeholder}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 16,
          lineHeight: 1.6,
          color: 'var(--ink)',
          borderBottom: 'none',
          border: '1px solid var(--rule)',
          padding: 14,
          background: 'var(--paper-soft)',
        }}
      />
    );
  }
  return (
    <p className="serif" style={{
      fontSize: 17,
      lineHeight: 1.65,
      color: value ? 'var(--ink)' : 'var(--ink-subtle)',
      whiteSpace: 'pre-wrap',
      fontStyle: value ? 'normal' : 'italic',
      maxWidth: 680,
    }}>
      {value || placeholder || '—'}
    </p>
  );
};

// ── Buttons ──────────────────────────────────────────────────────────────────

const EditorialBtn = ({ onClick, disabled, children, accent, danger }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.14em',
      background: 'transparent',
      color: danger ? 'var(--danger)' : accent ? 'var(--accent)' : 'var(--ink)',
      border: 'none',
      borderBottom: `1.5px solid ${danger ? 'var(--danger)' : accent ? 'var(--accent)' : 'var(--ink)'}`,
      paddingBottom: 2,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transition: 'opacity 0.15s, transform 0.15s',
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => e.currentTarget.style.transform = ''}
  >
    {children}
  </button>
);

// ── Main ─────────────────────────────────────────────────────────────────────

export default function RevisionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [revision, setRevision] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [generating, setGenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingNotion, setSyncingNotion] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (text, type = 'error') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    api.getRevision(id)
      .then(res => { setRevision(res.data); setForm(res.data); })
      .catch(() => navigate('/'));
  }, [id]);

  const handleSave = async () => {
    try {
      const updated = await api.updateRevision(id, {
        questionHumanWords: form.questionHumanWords,
        howISolvedIt: form.howISolvedIt,
        thingsToRemember: form.thingsToRemember,
        topic: form.topic,
      });
      setRevision(updated.data); setForm(updated.data); setEditing(false);
      notify('Changes saved', 'success');
    } catch (err) { notify(err.message || 'Failed to save'); }
  };

  const handleGenerate = async () => {
    if (!window.confirm('Regenerate AI notes? This will overwrite current notes.')) return;
    setGenerating(true);
    try {
      const res = await api.generateNotes(id);
      setRevision(res.data); setForm(res.data);
      notify('Notes regenerated', 'success');
    } catch (err) { notify(err.message || 'Generation failed'); }
    finally { setGenerating(false); }
  };

  const handleSyncSheets = async () => {
    setSyncing(true);
    try { await api.syncToSheets(id); notify('Synced to Google Sheets', 'success'); }
    catch (err) { notify(err.message || 'Sync failed'); }
    finally { setSyncing(false); }
  };

  const handleSyncNotion = async () => {
    setSyncingNotion(true);
    try { await api.syncToNotion(id); notify('Synced to Notion', 'success'); }
    catch (err) { notify(err.message || 'Notion sync failed'); }
    finally { setSyncingNotion(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this revision? This cannot be undone.')) return;
    setDeleting(true);
    try { await api.deleteRevision(id); navigate('/'); }
    catch (err) { notify(err.message || 'Delete failed'); setDeleting(false); }
  };

  if (!revision) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-muted)' }}>
        <span className="spinner" />
        <span className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em' }}>Loading entry…</span>
      </div>
    );
  }

  const date = revision.lastAttemptedAt
    ? new Date(revision.lastAttemptedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
    : '';
  const minutes = Math.round((revision.timeSpentSeconds || 0) / 60);

  return (
    <div className="page paper-grain" style={{ paddingTop: 36 }}>

      {/* Back nav */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: 'var(--ink-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: 36,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-muted)'}
      >
        ← Back to the log
      </button>

      {/* Editorial masthead */}
      <header style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <span className="eyebrow">An Entry · {revision.language || 'Solution'}</span>
          {date && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{date}</span>}
        </div>
        <div className="rule-thick" style={{ marginBottom: 32 }} />

        <h1 className="display" style={{
          fontSize: 'clamp(40px, 6vw, 64px)',
          fontWeight: 300,
          fontVariationSettings: '"opsz" 144, "SOFT" 100',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          marginBottom: 22,
        }}>
          {revision.title || revision.problemSlug}
        </h1>

        {/* Metadata strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
          {revision.difficulty && (
            <span className={`badge ${DIFF_CLASS[revision.difficulty] || 'badge-default'}`}>{revision.difficulty}</span>
          )}
          {revision.status === 'Accepted' && (
            <>
              <span style={{ color: 'var(--rule)' }}>·</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ok)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600 }}>✓ Accepted</span>
            </>
          )}
          {revision.topic && (
            <>
              <span style={{ color: 'var(--rule)' }}>·</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{revision.topic}</span>
            </>
          )}
          {revision.url && (
            <>
              <span style={{ color: 'var(--rule)' }}>·</span>
              <a href={revision.url} target="_blank" rel="noreferrer" className="mono" style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600 }}>
                View on LeetCode ↗
              </a>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {!editing ? (
            <>
              <EditorialBtn onClick={() => setEditing(true)}>Edit notes</EditorialBtn>
              <EditorialBtn onClick={handleGenerate} disabled={generating} accent>
                {generating ? 'Regenerating…' : 'Regenerate AI'}
              </EditorialBtn>
              <EditorialBtn onClick={handleSyncSheets} disabled={syncing}>
                {syncing ? 'Syncing…' : 'Push → Sheets'}
              </EditorialBtn>
              <EditorialBtn onClick={handleSyncNotion} disabled={syncingNotion}>
                {syncingNotion ? 'Syncing…' : 'Push → Notion'}
              </EditorialBtn>
              <span style={{ flex: 1 }} />
              <EditorialBtn onClick={handleDelete} disabled={deleting} danger>
                {deleting ? 'Deleting…' : 'Delete entry'}
              </EditorialBtn>
            </>
          ) : (
            <>
              <button onClick={handleSave} className="btn-ink" style={{ padding: '10px 18px', fontSize: 12 }}>
                Save changes <span className="mono" style={{ marginLeft: 8 }}>↵</span>
              </button>
              <EditorialBtn onClick={() => { setEditing(false); setForm(revision); }}>Cancel</EditorialBtn>
            </>
          )}
        </div>

        {notification && (
          <div className={`inline-alert inline-alert-${notification.type}`} style={{ marginTop: 20, display: 'inline-block' }}>
            {notification.text}
          </div>
        )}
      </header>

      {/* The Question */}
      <Section num={ROMAN[0]} label="The Question · What it asks">
        <Prose
          value={editing ? form.questionHumanWords : revision.questionHumanWords}
          editing={editing}
          onChange={v => setForm(f => ({ ...f, questionHumanWords: v }))}
          placeholder="No description yet."
        />
      </Section>

      {/* The Approach */}
      <Section num={ROMAN[1]} label="The Approach · How I solved it">
        <Prose
          value={editing ? form.howISolvedIt : revision.howISolvedIt}
          editing={editing}
          onChange={v => setForm(f => ({ ...f, howISolvedIt: v }))}
          placeholder="No approach notes yet."
        />
      </Section>

      {/* Worth remembering */}
      <Section num={ROMAN[2]} label="Worth remembering · For next time">
        <Prose
          value={editing ? form.thingsToRemember : revision.thingsToRemember}
          editing={editing}
          onChange={v => setForm(f => ({ ...f, thingsToRemember: v }))}
          placeholder="No notes yet."
        />
      </Section>

      {editing && (
        <Section num={ROMAN[3]} label="Topic · Filed under">
          <input
            type="text"
            value={form.topic || ''}
            onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
            placeholder="e.g. Dynamic Programming"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}
          />
        </Section>
      )}

      {/* Tags */}
      {revision.tags?.length > 0 && (
        <Section num={ROMAN[editing ? 4 : 3]} label="Tags · Catalogued under">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline' }}>
            {revision.tags.map((t, i) => (
              <span key={t} className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)', letterSpacing: '0.05em' }}>
                {t}{i < revision.tags.length - 1 && <span style={{ color: 'var(--rule)', marginLeft: 10 }}>·</span>}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* The Session */}
      <Section num={ROMAN[editing ? 5 : (revision.tags?.length > 0 ? 4 : 3)]} label="The Session · Activity ledger">
        <div style={{ display: 'flex', gap: 48, marginBottom: 18, flexWrap: 'wrap' }}>
          <div>
            <div className="display" style={{ fontSize: 40, fontWeight: 300, color: 'var(--ink)', lineHeight: 1, fontVariationSettings: '"opsz" 144, "SOFT" 80' }}>{revision.totalRuns || 0}</div>
            <div className="label" style={{ marginTop: 8 }}>Runs</div>
          </div>
          <div>
            <div className="display" style={{ fontSize: 40, fontWeight: 300, color: 'var(--ink)', lineHeight: 1, fontVariationSettings: '"opsz" 144, "SOFT" 80' }}>{revision.totalSubmissions || 0}</div>
            <div className="label" style={{ marginTop: 8 }}>Submissions</div>
          </div>
          <div>
            <div className="display" style={{ fontSize: 40, fontWeight: 300, color: 'var(--accent)', lineHeight: 1, fontVariationSettings: '"opsz" 144, "SOFT" 80' }}>{minutes}<span style={{ fontSize: 18, marginLeft: 4 }}>m</span></div>
            <div className="label" style={{ marginTop: 8 }}>Time spent</div>
          </div>
        </div>

        {revision.events?.length > 0 && (
          <>
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="btn-link"
              style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-muted)', borderColor: 'var(--ink-muted)' }}
            >
              {showSessions ? 'Hide' : 'Show'} timeline ({revision.events.length} events)
            </button>
            {showSessions && (
              <div style={{ marginTop: 20, borderTop: '1px solid var(--rule)', paddingTop: 16 }}>
                {revision.events.map((e, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 80px 1fr', gap: 16, padding: '8px 0', borderBottom: i < revision.events.length - 1 ? '1px solid var(--rule-soft)' : 'none', alignItems: 'baseline' }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-subtle)', letterSpacing: '0.05em' }}>
                      {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                      {e.type}
                    </span>
                    {e.status && (
                      <span className="mono" style={{ fontSize: 11, color: e.status === 'Accepted' ? 'var(--ok)' : 'var(--danger)', letterSpacing: '0.05em' }}>
                        → {e.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Section>

      {/* Code */}
      {revision.code && (
        <Section num={ROMAN[(editing ? 6 : (revision.tags?.length > 0 ? 5 : 4))]} label={`The Solution · ${revision.language || 'Code'}`}>
          <pre style={{
            background: 'var(--paper-deep)',
            border: '1px solid var(--rule)',
            padding: 24,
            fontFamily: 'var(--font-mono)',
            fontSize: 12.5,
            lineHeight: 1.7,
            color: 'var(--ink)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowX: 'auto',
          }}>
            {revision.code}
          </pre>
        </Section>
      )}

      {/* Colophon */}
      <div style={{ borderTop: '1px solid var(--rule)', marginTop: 64, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
          End of entry
        </span>
        <button onClick={() => navigate('/dashboard')} className="btn-link" style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-muted)', borderColor: 'var(--ink-muted)' }}>
          ← Back to the log
        </button>
      </div>

    </div>
  );
}
