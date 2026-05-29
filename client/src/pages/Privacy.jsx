import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }} className="paper-grain">
      <nav style={{ borderBottom: '1px solid var(--rule)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid var(--rule)', objectFit: 'cover' }} />
            <span className="display-italic" style={{ fontSize: 26, color: 'var(--ink)' }}>LeetLog</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.18em', borderLeft: '1px solid var(--rule)', paddingLeft: 10 }}>Vol. I</span>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 32px 120px' }}>
        <span className="eyebrow">Legal</span>
        <div className="rule-thick" style={{ marginTop: 14, marginBottom: 28 }} />
        <h1 className="display" style={{ fontSize: 52, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12 }}>
          Privacy Policy
        </h1>
        <p className="serif" style={{ fontSize: 15, color: 'var(--ink-soft)', fontStyle: 'italic', marginBottom: 48 }}>
          Last updated: May 2025
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          <section>
            <h2 className="sans" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, color: 'var(--ink)' }}>Overview</h2>
            <p className="serif" style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-soft)' }}>
              LeetLog ("we", "us") is a tool that helps you track and review your LeetCode problem-solving sessions.
              This policy explains what data we collect, how we use it, and your rights over it.
              We collect only what is necessary to provide the service.
            </p>
          </section>

          <div style={{ borderTop: '1px solid var(--rule)' }} />

          <section>
            <h2 className="sans" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, color: 'var(--ink)' }}>Data we collect</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Account data', text: 'Email address and hashed password when you register.' },
                { label: 'Session data', text: 'LeetCode problem metadata (title, difficulty, tags, URL), your submitted code, run/submit counts, and time spent on a problem. This is captured by the Chrome extension only while you are actively on a LeetCode problem page.' },
                { label: 'Integration tokens', text: 'If you connect Notion, we store your Notion OAuth access token. If you connect Google Sheets, no token is stored — a shared service account is used.' },
                { label: 'Usage data', text: 'Standard server logs (IP address, request timestamps). These are not shared and are retained for 30 days.' },
              ].map(({ label, text }) => (
                <div key={label} style={{ display: 'flex', gap: 20 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', minWidth: 140, paddingTop: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
                  <p className="serif" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)', margin: 0 }}>{text}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: '1px solid var(--rule)' }} />

          <section>
            <h2 className="sans" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, color: 'var(--ink)' }}>How we use your data</h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 0, listStyle: 'none' }}>
              {[
                'To authenticate your account and secure your session.',
                'To store and display your LeetCode revision history.',
                'To generate AI revision notes via the Groq API. Your code and problem data are sent to Groq for this purpose.',
                'To sync your entries to Notion or Google Sheets when you enable those integrations.',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-subtle)', paddingTop: 4 }}>{'0' + (i + 1)}</span>
                  <span className="serif" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <div style={{ borderTop: '1px solid var(--rule)' }} />

          <section>
            <h2 className="sans" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, color: 'var(--ink)' }}>Third-party services</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'Groq API', detail: 'Used for AI note generation. Problem data and code are sent to Groq. See groq.com/privacy.' },
                { name: 'Notion', detail: 'If connected, session entries are synced to your Notion workspace via their official API.' },
                { name: 'Google Sheets', detail: 'If connected, entries are written to your specified sheet via a Google service account.' },
                { name: 'MongoDB Atlas', detail: 'Your data is stored in MongoDB Atlas (cloud database). See mongodb.com/privacy.' },
              ].map(({ name, detail }) => (
                <div key={name} style={{ display: 'flex', gap: 20 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', minWidth: 140, paddingTop: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{name}</span>
                  <p className="serif" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)', margin: 0 }}>{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ borderTop: '1px solid var(--rule)' }} />

          <section>
            <h2 className="sans" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, color: 'var(--ink)' }}>Chrome extension</h2>
            <p className="serif" style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-soft)' }}>
              The LeetLog Chrome extension stores your authentication token and session state locally using
              <span className="mono" style={{ fontSize: 13, background: 'var(--surface)', padding: '1px 6px', borderRadius: 4, margin: '0 4px' }}>chrome.storage.local</span>
              on your device only. It only activates on <span className="mono" style={{ fontSize: 13 }}>leetcode.com/problems/*</span> pages
              and does not read, transmit, or store any data from other websites.
            </p>
          </section>

          <div style={{ borderTop: '1px solid var(--rule)' }} />

          <section>
            <h2 className="sans" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, color: 'var(--ink)' }}>Your rights</h2>
            <p className="serif" style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-soft)' }}>
              You can delete any revision entry from your dashboard at any time. To request full account deletion
              including all stored data, email us at the address below. We will process deletion requests within 7 days.
            </p>
          </section>

          <div style={{ borderTop: '1px solid var(--rule)' }} />

          <section>
            <h2 className="sans" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, color: 'var(--ink)' }}>Contact</h2>
            <p className="serif" style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-soft)' }}>
              Questions about this policy? Email{' '}
              <a href="mailto:tejasganesh323@gmail.com" style={{ color: 'var(--accent)' }}>tejasganesh323@gmail.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
