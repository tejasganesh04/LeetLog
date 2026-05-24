export default function EmptyState({ title, subtitle }) {
  return (
    <div style={{
      padding: '80px 0 96px',
      textAlign: 'center',
      borderTop: '1px solid var(--rule)',
      borderBottom: '1px solid var(--rule)',
    }}>
      <div className="mono" style={{
        fontSize: 11,
        color: 'var(--ink-subtle)',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        marginBottom: 24,
      }}>
        · · ·
      </div>
      <h3 className="display-italic" style={{
        fontSize: 36,
        color: 'var(--ink)',
        marginBottom: 14,
        fontWeight: 400,
      }}>
        {title}
      </h3>
      {subtitle && (
        <p className="serif" style={{
          fontSize: 15,
          color: 'var(--ink-muted)',
          maxWidth: 380,
          margin: '0 auto',
          lineHeight: 1.55,
          fontStyle: 'italic',
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
