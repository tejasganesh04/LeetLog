import { Link } from 'react-router-dom';

// ──────────────────────────────────────────────────────────────────────────────
// LeetLog · Landing — editorial almanac
// ──────────────────────────────────────────────────────────────────────────────

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

// ── Product mock cards (editorial / journal style) ───────────────────────────

const ExtensionMock = () => (
  <div className="mock-card">
    <div className="mock-head">
      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>leetcode.com/two-sum</span>
      <span className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>● Watching</span>
    </div>
    <div className="rule" style={{ marginBottom: 18 }} />
    <h4 className="serif" style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)', marginBottom: 10, letterSpacing: '-0.01em' }}>Two Sum</h4>
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
      <span className="badge badge-easy">Easy</span>
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)', letterSpacing: '0.08em' }}>14m · 3 runs · 1 submit</span>
    </div>
    <div className="rule-soft" style={{ marginBottom: 14 }} />
    <p className="label" style={{ marginBottom: 8 }}>LeetLog captured</p>
    <p className="serif" style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.55 }}>
      Used a hash map to store seen values. For each number, check if its complement already exists in the map.
    </p>
    <div style={{ marginTop: 22 }}>
      <button className="btn-ink" style={{ width: '100%', justifyContent: 'space-between', padding: '12px 16px' }}>
        <span>Save + Generate Notes</span>
        <span className="mono" style={{ fontSize: 11 }}>↵</span>
      </button>
    </div>
  </div>
);

const DashboardMock = () => (
  <div className="mock-card">
    <div className="mock-head">
      <span className="eyebrow">The Index · Recent entries</span>
      <span className="mono" style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>24 SOLVED</span>
    </div>
    <div className="rule" />
    {[
      { name: 'Two Sum', diff: 'easy', tag: 'Hash Map', date: 'TODAY', num: '024' },
      { name: 'Longest Common Subsequence', diff: 'medium', tag: 'DP', date: 'MAY 20', num: '023' },
      { name: 'Best Time to Buy Stock', diff: 'easy', tag: 'Greedy', date: 'MAY 18', num: '022' },
    ].map((p, i) => (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 70px', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--rule-soft)', alignItems: 'baseline' }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', letterSpacing: '0.08em' }}>№ {p.num}</span>
        <div>
          <div className="serif" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{p.name}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className={`badge badge-${p.diff}`}>{p.diff}</span>
            <span style={{ color: 'var(--rule)' }}>·</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.tag}</span>
          </div>
        </div>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textAlign: 'right', letterSpacing: '0.14em' }}>{p.date}</span>
      </div>
    ))}
  </div>
);

const SyncMock = () => (
  <div className="mock-card">
    <div className="mock-head">
      <span className="eyebrow">Connections · Synced</span>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />
    </div>
    <div className="rule" style={{ marginBottom: 18 }} />
    {[
      { name: 'Google Sheets', meta: '24 rows · last synced now', glyph: '▦' },
      { name: 'Notion', meta: 'LeetLog Problems · 24 pages', glyph: 'N' },
    ].map((s, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: i === 0 ? '1px solid var(--rule-soft)' : 'none' }}>
        <span className="display" style={{ fontSize: 36, color: 'var(--ink-muted)', fontWeight: 400 }}>{s.glyph}</span>
        <div style={{ flex: 1 }}>
          <div className="serif" style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>{s.name}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.meta}</div>
        </div>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />
      </div>
    ))}
    <div style={{ marginTop: 18, padding: '12px 14px', borderLeft: '2px solid var(--accent)' }}>
      <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>↑ Two Sum synced</span>
    </div>
  </div>
);

// ── Feature section (editorial spread) ───────────────────────────────────────

const FeatureSection = ({ chapter, eyebrow, title, italic, desc, card, reverse }) => (
  <section style={{ borderTop: '1px solid var(--rule)' }}>
    <div style={{
      maxWidth: 1180, margin: '0 auto', padding: '88px 32px',
      display: 'grid', gridTemplateColumns: reverse ? '1fr 1fr' : '1fr 1fr', gap: 64, alignItems: 'center'
    }}>
      <div style={{ order: reverse ? 2 : 1 }}>
        <span className="eyebrow">{chapter} · {eyebrow}</span>
        <div className="rule-thick" style={{ marginTop: 14, marginBottom: 24, maxWidth: 60 }} />
        <h2 className="display" style={{ fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 300, fontVariationSettings: '"opsz" 144, "SOFT" 80', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 22 }}>
          {title}{' '}
          <span className="display-italic" style={{ color: 'var(--accent)' }}>{italic}</span>
        </h2>
        <p className="serif" style={{ fontSize: 17, color: 'var(--ink-soft)', lineHeight: 1.6, fontStyle: 'italic', maxWidth: 440 }}>
          {desc}
        </p>
      </div>
      <div style={{ order: reverse ? 1 : 2, display: 'flex', justifyContent: 'center' }}>{card}</div>
    </div>
  </section>
);

// ──────────────────────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div style={{ background: 'var(--paper)' }} className="paper-grain">

      {/* Masthead */}
      <nav style={{ borderBottom: '1px solid var(--rule)', position: 'sticky', top: 0, zIndex: 50, background: 'var(--paper)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid var(--rule)', objectFit: 'cover' }} />
            <span className="display-italic" style={{ fontSize: 26, color: 'var(--ink)' }}>LeetLog</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.18em', borderLeft: '1px solid var(--rule)', paddingLeft: 10 }}>Vol. I · Iss. 01</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <Link to="/login" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.16em', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--ink)'}
              onMouseLeave={e => e.target.style.color = 'var(--ink-muted)'}
            >Sign in</Link>
            <Link to="/get-started" className="btn-ink" style={{ padding: '10px 18px', fontSize: 12 }}>
              Begin your log <span className="mono" style={{ marginLeft: 4 }}>→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — Editorial broadsheet */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 32px 72px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
          <span className="eyebrow">№ 001 · The Engineer's Almanac</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{today}</span>
        </div>
        <div className="rule-thick" style={{ marginBottom: 40 }} />

        <h1 className="display" style={{
          fontSize: 'clamp(64px, 10vw, 144px)',
          fontWeight: 300,
          fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 0',
          letterSpacing: '-0.045em',
          lineHeight: 0.92,
          marginBottom: 36,
          maxWidth: 1100,
        }}>
          Stop forgetting<br/>
          your <span className="display-italic" style={{ color: 'var(--accent)' }}>LeetCode</span> solutions.
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 64, alignItems: 'end', maxWidth: 1100 }}>
          <p className="serif" style={{ fontSize: 22, color: 'var(--ink-soft)', lineHeight: 1.45, fontStyle: 'italic', maxWidth: 580 }}>
            A quiet companion that watches every solve, drafts your revision notes, and files them away in the workspace you already trust.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
            <Link to="/get-started" className="btn-ink" style={{ padding: '16px 26px', fontSize: 14 }}>
              Begin your log
              <span className="mono" style={{ marginLeft: 10 }}>→</span>
            </Link>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              Free · No credit card · 2 minute setup
            </span>
          </div>
        </div>
      </section>

      {/* The premise — like a magazine table of contents */}
      <section style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 32, flexWrap: 'wrap' }}>
              <span className="eyebrow">In this issue —</span>
              {[
                { n: 'I', t: 'The Capture' },
                { n: 'II', t: 'The Index' },
                { n: 'III', t: 'The Sync' },
              ].map(c => (
                <span key={c.n} className="mono" style={{ fontSize: 12, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  <span style={{ color: 'var(--accent)', marginRight: 8, fontWeight: 700 }}>{c.n}</span> {c.t}
                </span>
              ))}
            </div>
            <span className="serif" style={{ fontSize: 13, color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              All filed, indexed, retrievable.
            </span>
          </div>
        </div>
      </section>

      {/* Feature spreads */}
      <FeatureSection
        chapter="I"
        eyebrow="The Capture · Chrome Extension"
        title="Install once."
        italic="It watches the rest."
        desc="Solve normally on LeetCode. LeetLog runs in the background — tracking your runs, submissions, and elapsed time without interrupting flow."
        card={<ExtensionMock />}
        reverse={false}
      />

      <FeatureSection
        chapter="II"
        eyebrow="The Index · Dashboard"
        title="Every problem,"
        italic="catalogued."
        desc="Your full history in one place. Filter by difficulty, topic, or date. Each entry gets AI-drafted notes — so you actually know what to revise."
        card={<DashboardMock />}
        reverse={true}
      />

      <FeatureSection
        chapter="III"
        eyebrow="The Sync · Integrations"
        title="It lives where"
        italic="you already work."
        desc="Connect Google Sheets or Notion once. Every save triggers an automatic sync — your data in your tools, structured the way you want it."
        card={<SyncMock />}
        reverse={false}
      />

      {/* Closing */}
      <section style={{ borderTop: '2px solid var(--ink)', background: 'var(--paper-deep)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '88px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 64, alignItems: 'end' }}>
            <div>
              <span className="eyebrow">Closing notes</span>
              <div className="rule-thick" style={{ marginTop: 14, marginBottom: 28, maxWidth: 60 }} />
              <h2 className="display" style={{ fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 300, fontVariationSettings: '"opsz" 144, "SOFT" 100', letterSpacing: '-0.035em', lineHeight: 0.95 }}>
                Stop grinding blind.<br/>
                <span className="display-italic" style={{ color: 'var(--accent)' }}>Start grinding smart.</span>
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
              <Link to="/get-started" className="btn-ink" style={{ padding: '18px 28px', fontSize: 14 }}>
                Begin your log <span className="mono" style={{ marginLeft: 10 }}>→</span>
              </Link>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                Free forever · No credit card
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Colophon footer */}
      <footer style={{ borderTop: '1px solid var(--rule)', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span className="display-italic" style={{ fontSize: 20, color: 'var(--ink)' }}>LeetLog</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Vol. I · Iss. 01 · © MMXXVI</span>
          </div>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
            Set in Fraunces, Bricolage Grotesque & JetBrains Mono · Printed on cream
          </span>
        </div>
      </footer>

      <style>{`
        .mock-card {
          background: var(--paper-soft);
          border: 1px solid var(--rule);
          padding: 28px;
          width: 100%;
          max-width: 440px;
          position: relative;
        }
        .mock-card::before {
          content: '';
          position: absolute;
          top: -1px; left: -1px; right: -1px; bottom: -1px;
          border: 1px solid var(--ink);
          transform: translate(6px, 6px);
          pointer-events: none;
          z-index: -1;
        }
        .mock-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
      `}</style>
    </div>
  );
}
