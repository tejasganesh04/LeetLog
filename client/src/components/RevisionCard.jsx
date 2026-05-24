import { useNavigate } from 'react-router-dom';

const DIFF_CLASS = { Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard' };

export default function RevisionCard({ revision, index }) {
  const navigate = useNavigate();
  const { _id, title, difficulty, topic, status, tags, questionHumanWords, lastAttemptedAt, notesStatus } = revision;

  const isGenerating = notesStatus === 'pending';
  const isFailed = notesStatus === 'failed' && !questionHumanWords;
  const hasNotes = !!questionHumanWords;

  const dateStr = lastAttemptedAt
    ? new Date(lastAttemptedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()
    : '';

  return (
    <article
      onClick={() => navigate(`/revision/${_id}`)}
      style={{
        display: 'grid',
        gridTemplateColumns: '64px 1fr 80px',
        gap: 24,
        padding: '22px 12px',
        borderBottom: '1px solid var(--rule)',
        cursor: 'pointer',
        transition: 'background 0.18s, padding 0.18s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--paper-soft)';
        e.currentTarget.style.paddingLeft = '20px';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.paddingLeft = '12px';
      }}
    >
      {/* Index number */}
      <div className="mono" style={{
        fontSize: 12,
        color: 'var(--ink-subtle)',
        fontWeight: 500,
        paddingTop: 4,
        letterSpacing: '0.05em',
      }}>
        № {String(index).padStart(3, '0')}
      </div>

      {/* Main content */}
      <div>
        <h3 className="serif" style={{
          fontSize: 19,
          fontWeight: 500,
          fontVariationSettings: '"opsz" 24, "SOFT" 30',
          color: 'var(--ink)',
          letterSpacing: '-0.015em',
          lineHeight: 1.2,
          marginBottom: 8,
        }}>
          {title || revision.problemSlug}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: hasNotes || isGenerating || isFailed ? 10 : 0 }}>
          {difficulty && (
            <span className={`badge ${DIFF_CLASS[difficulty] || 'badge-default'}`}>
              {difficulty}
            </span>
          )}
          {status === 'Accepted' && (
            <span className="mono" style={{ fontSize: 10, color: 'var(--ok)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600 }}>
              ✓ Accepted
            </span>
          )}
          {topic && (
            <>
              <span style={{ color: 'var(--rule)' }}>·</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500 }}>
                {topic}
              </span>
            </>
          )}
          {tags?.length > 0 && (
            <>
              <span style={{ color: 'var(--rule)' }}>·</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-subtle)', letterSpacing: '0.05em' }}>
                {tags.slice(0, 4).join(' · ')}
              </span>
            </>
          )}
        </div>

        {isGenerating && (
          <p className="pulse serif" style={{ fontSize: 13, color: 'var(--accent)', fontStyle: 'italic' }}>
            Drafting your notes…
          </p>
        )}
        {isFailed && (
          <p className="mono" style={{ fontSize: 11, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Notes unavailable — click to regenerate
          </p>
        )}
        {hasNotes && (
          <p className="serif" style={{
            fontSize: 14,
            color: 'var(--ink-soft)',
            lineHeight: 1.55,
            fontStyle: 'italic',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxWidth: 720,
          }}>
            {questionHumanWords}
          </p>
        )}
      </div>

      {/* Date */}
      <div className="mono" style={{
        fontSize: 10,
        color: 'var(--ink-subtle)',
        textAlign: 'right',
        paddingTop: 6,
        letterSpacing: '0.14em',
        fontWeight: 500,
      }}>
        {dateStr}
      </div>
    </article>
  );
}
