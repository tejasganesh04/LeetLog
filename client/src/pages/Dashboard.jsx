import { useState, useEffect } from 'react';
import { api } from '../services/api';
import RevisionCard from '../components/RevisionCard';
import EmptyState from '../components/EmptyState';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const DIFF_COLOR = { Easy: 'var(--ok)', Medium: 'var(--warn)', Hard: 'var(--danger)' };

export default function Dashboard() {
  const [revisions, setRevisions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const fetchData = () =>
    Promise.all([api.getRevisions(), api.getSummary()])
      .then(([rRes, sRes]) => { setRevisions(rRes.data); setSummary(sRes.data); })
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const hasPending = revisions.some(r => r.notesStatus === 'pending');
    if (!hasPending) return;
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [revisions]);

  const filtered = revisions.filter(r => {
    const matchSearch = !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.topic?.toLowerCase().includes(search.toLowerCase()) ||
      r.problemSlug?.toLowerCase().includes(search.toLowerCase());
    const matchDiff = difficulty === 'All' || r.difficulty === difficulty;
    return matchSearch && matchDiff;
  });

  const handleExportCSV = async () => {
    setExporting(true);
    setExportError('');
    try {
      const blob = await api.exportCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'leetlog-revisions.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err.message || 'Export failed');
      setTimeout(() => setExportError(''), 4000);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wide" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-muted)' }}>
        <span className="spinner" />
        <span className="mono" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.16em' }}>Loading the log...</span>
      </div>
    );
  }

  const stats = summary ? [
    { label: 'Logged', value: summary.total },
    { label: 'Solved', value: summary.solved },
    { label: 'Easy',   value: summary.byDifficulty?.Easy   || 0, color: 'var(--ok)' },
    { label: 'Medium', value: summary.byDifficulty?.Medium || 0, color: 'var(--warn)' },
    { label: 'Hard',   value: summary.byDifficulty?.Hard   || 0, color: 'var(--danger)' },
  ] : [];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  const issueNumber = String(revisions.length).padStart(3, '0');

  return (
    <div className="page-wide paper-grain" style={{ minHeight: '100vh' }}>

      {/* Editorial masthead */}
      <header style={{ marginBottom: 56 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <span className="eyebrow">№ {issueNumber} · The Revision Log</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{today}</span>
        </div>
        <div className="rule-thick" style={{ marginBottom: 24 }} />
        <h1 className="display" style={{ fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 300, fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 0' }}>
          Your problems,<br/>
          <span className="display-italic" style={{ color: 'var(--accent)' }}>indexed.</span>
        </h1>
        <p className="serif" style={{ marginTop: 18, fontSize: 17, color: 'var(--ink-soft)', maxWidth: 540, lineHeight: 1.5, fontStyle: 'italic' }}>
          A running record of every LeetCode problem you've touched, with notes worth returning to.
        </p>
      </header>

      {/* Almanac stats */}
      {summary && summary.total > 0 && (
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="label">The Numbers · By difficulty</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>updated live</span>
          </div>
          <div className="rule" style={{ background: 'var(--ink)', height: 2, marginBottom: 0 }} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            background: 'var(--paper)',
          }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                padding: '32px 24px 28px',
                borderRight: i < stats.length - 1 ? '1px solid var(--rule)' : 'none',
                position: 'relative',
              }}>
                <div className="display" style={{
                  fontSize: 64,
                  fontWeight: 300,
                  fontVariationSettings: '"opsz" 144, "SOFT" 30, "WONK" 0',
                  color: s.color || 'var(--ink)',
                  letterSpacing: '-0.04em',
                  lineHeight: 0.95,
                  marginBottom: 14,
                }}>
                  {String(s.value).padStart(2, '0')}
                </div>
                <div className="rule" style={{ width: 24, marginBottom: 8 }} />
                <div className="label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="rule" style={{ background: 'var(--ink)', height: 1 }} />
        </section>
      )}

      {/* Toolbar — editorial style */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="label">The Index · {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {exportError && <span className="mono" style={{ fontSize: 11, color: 'var(--danger)' }}>{exportError}</span>}
            <button onClick={handleExportCSV} disabled={exporting} className="btn-link" style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-muted)', borderColor: 'var(--ink-muted)' }}>
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        </div>
        <div className="rule-thick" style={{ marginBottom: 18 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 240, position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>⌕</span>
            <input
              placeholder="Search by title, topic, slug…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 13, paddingLeft: 0, paddingBottom: 8 }}
            />
          </div>

          {/* Difficulty filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="label" style={{ marginRight: 10 }}>Filter</span>
            {DIFFICULTIES.map((d, i) => (
              <span key={d} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <span style={{ color: 'var(--rule)', margin: '0 4px' }}>·</span>}
                <button
                  onClick={() => setDifficulty(d)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    background: 'transparent',
                    border: 'none',
                    padding: '4px 2px',
                    cursor: 'pointer',
                    color: difficulty === d ? (DIFF_COLOR[d] || 'var(--ink)') : 'var(--ink-subtle)',
                    borderBottom: difficulty === d ? `2px solid ${DIFF_COLOR[d] || 'var(--ink)'}` : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (difficulty !== d) e.currentTarget.style.color = 'var(--ink)'; }}
                  onMouseLeave={e => { if (difficulty !== d) e.currentTarget.style.color = 'var(--ink-subtle)'; }}
                >
                  {d}
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title={revisions.length === 0 ? 'The log is empty.' : 'No entries match.'}
          subtitle={revisions.length === 0 ? 'Install the extension, solve a problem, and the first entry will appear here.' : 'Adjust your search or filter to find what you\'re looking for.'}
        />
      ) : (
        <div>
          <div className="rule" />
          {filtered.map((r, i) => (
            <RevisionCard key={r._id} revision={r} index={revisions.length - revisions.indexOf(r)} />
          ))}
        </div>
      )}
    </div>
  );
}
