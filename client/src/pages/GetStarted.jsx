import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const INTEGRATIONS = [
  {
    id: 'notion',
    name: 'Notion',
    recommended: true,
    tagline: 'A living database of every problem you solve.',
    desc: 'Each problem becomes a page — your notes, the approach, AI-generated revision tips. Filter, search, tag. Your second brain for LeetCode.',
    glyph: 'N',
    accent: '#1A1410',
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    recommended: false,
    tagline: 'Your problems, in a spreadsheet you already know.',
    desc: 'Every solve syncs as a row — name, difficulty, topic, notes, date. Easy to filter, share, or build your own reports on top of.',
    glyph: '▦',
    accent: '#4A6B2A',
  },
];

export default function GetStarted() {
  const [selected, setSelected] = useState('notion');
  const navigate = useNavigate();
  const current = INTEGRATIONS.find(i => i.id === selected);

  const handleContinue = () => navigate(`/register?via=${selected}`);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }} className="paper-grain">

      {/* Masthead */}
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

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 32px 80px' }}>

        {/* Editorial header */}
        <header style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <span className="eyebrow">Chapter I · The Setup</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Step 1 / 2</span>
          </div>
          <div className="rule-thick" style={{ marginBottom: 28 }} />
          <h1 className="display" style={{ fontSize: 'clamp(48px, 7vw, 84px)', fontWeight: 300, fontVariationSettings: '"opsz" 144, "SOFT" 100', letterSpacing: '-0.035em', lineHeight: 1 }}>
            Where will your<br/>
            <span className="display-italic" style={{ color: 'var(--accent)' }}>log live?</span>
          </h1>
          <p className="serif" style={{ marginTop: 22, fontSize: 18, color: 'var(--ink-soft)', maxWidth: 560, lineHeight: 1.5, fontStyle: 'italic' }}>
            LeetLog syncs to one place you already use. Pick your workspace and every solve will flow there automatically.
          </p>
        </header>

        {/* The picks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)', marginBottom: 48 }}>
          {INTEGRATIONS.map((intg) => {
            const isSel = selected === intg.id;
            return (
              <button
                key={intg.id}
                onClick={() => setSelected(intg.id)}
                style={{
                  background: isSel ? 'var(--paper-soft)' : 'var(--paper)',
                  padding: '36px 32px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                  transition: 'background 0.2s',
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  outline: isSel ? '2px solid var(--accent)' : 'none',
                  outlineOffset: -2,
                  zIndex: isSel ? 2 : 1,
                }}
              >
                {/* Chapter mark */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
                  <span className="mono" style={{ fontSize: 10, color: isSel ? 'var(--accent)' : 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600 }}>
                    {intg.recommended ? '★ Recommended' : 'Alternative'}
                  </span>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: `1.5px solid ${isSel ? 'var(--accent)' : 'var(--ink-subtle)'}`,
                    background: isSel ? 'var(--accent)' : 'transparent',
                    position: 'relative',
                    transition: 'all 0.2s',
                  }}>
                    {isSel && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 5, height: 5, borderRadius: '50%', background: 'var(--paper)' }} />
                    )}
                  </div>
                </div>

                {/* Big letter glyph */}
                <div className="display" style={{
                  fontSize: 96,
                  fontWeight: 300,
                  fontVariationSettings: '"opsz" 144, "SOFT" 100',
                  color: intg.accent,
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                  marginBottom: 8,
                }}>
                  {intg.glyph}
                </div>

                <div className="display" style={{ fontSize: 30, fontWeight: 400, lineHeight: 1.1, color: 'var(--ink)', marginBottom: 6, letterSpacing: '-0.02em' }}>
                  {intg.name}
                </div>
                <p className="serif" style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--ink-soft)', marginBottom: 22, lineHeight: 1.5 }}>
                  {intg.tagline}
                </p>

                <div className="rule" style={{ background: 'var(--rule)', marginBottom: 16 }} />

                <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6, fontFamily: 'var(--font-sans)' }}>
                  {intg.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <p className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            You picked <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{current?.name}</span>. Change anytime later.
          </p>
          <button onClick={handleContinue} className="btn-ink" style={{ padding: '16px 28px', fontSize: 14 }}>
            Continue with {current?.name}
            <span className="mono" style={{ marginLeft: 8 }}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
