import { SECTION_LABELS } from '../../data/themes';
import { yearLevelLabel } from '../../utils/marsu';

const CATEGORY_LABELS = {
  certificate: 'Certificate',
  training: 'Training',
  award: 'Award',
  seminar: 'Seminar',
  other: 'Other',
};

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function AchievementCard({ item }) {
  return (
    <article className="pf-ach-card">
      <div className="pf-ach-top">
        <span className="pf-badge">{CATEGORY_LABELS[item.category] || item.category}</span>
        {item.dateReceived && <span className="pf-date">{formatDate(item.dateReceived)}</span>}
      </div>
      <h4>{item.title}</h4>
      {item.issuer && <p className="pf-issuer">{item.issuer}</p>}
      {item.description && <p className="pf-desc">{item.description}</p>}
      {item.proofType === 'url' && item.proofUrl ? (
        <a href={item.proofUrl} target="_blank" rel="noreferrer" className="pf-proof-link">
          View proof ↗
        </a>
      ) : (
        <span className="pf-proof-file">📎 {item.fileUrl ? 'Attachment uploaded' : 'Proof file (no preview in mock)'}</span>
      )}
    </article>
  );
}

export default function PortfolioView({ portfolio, settings }) {
  const { theme, accentColor, sectionOrder, showSections } = settings;
  const visible = sectionOrder.filter((s) => showSections[s]);

  const renderSection = (key) => {
    switch (key) {
      case 'about':
        return (
          <section key={key} className="pf-section">
            <h3 className="pf-section-title">{SECTION_LABELS.about}</h3>
            <p>{portfolio.bio}</p>
            {portfolio.skills?.length > 0 && (
              <div className="pf-skills">
                {portfolio.skills.map((s) => (
                  <span key={s} className="pf-skill">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </section>
        );
      case 'achievements':
        return (
          <section key={key} className="pf-section">
            <h3 className="pf-section-title">
              {SECTION_LABELS.achievements} ({portfolio.achievements?.length || 0})
            </h3>
            <div className="pf-ach-grid">
              {(portfolio.achievements || []).map((a) => (
                <AchievementCard key={a._id} item={a} />
              ))}
            </div>
          </section>
        );
      case 'education':
        return (
          <section key={key} className="pf-section">
            <h3 className="pf-section-title">{SECTION_LABELS.education}</h3>
            {portfolio.education?.length > 0 ? (
              <div className="pf-ach-grid">
                {portfolio.education.map((e, i) => (
                  <div key={i} className="pf-ach-card">
                    <h4>{e.school || 'School'}</h4>
                    {e.degree && <p className="pf-issuer">{e.degree}</p>}
                    {(e.startYear || e.endYear) && (
                      <p className="pf-date">
                        {[e.startYear, e.endYear].filter(Boolean).join(' – ')}
                      </p>
                    )}
                    {e.details && <p className="pf-desc">{e.details}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="pf-edu card">
                <p>
                  <strong>{portfolio.course}</strong>
                  {portfolio.yearLevel ? ` • ${yearLevelLabel(portfolio.yearLevel, portfolio.role)}` : ''}
                  {portfolio.section ? ` • Section ${portfolio.section}` : ''}
                </p>
                {portfolio.studentId && (
                  <p className="muted">Student ID: {portfolio.studentId}</p>
                )}
                <p className="muted">{portfolio.email}</p>              </div>
            )}
          </section>
        );
      case 'contact':
        return (
          <section key={key} className="pf-section">
            <h3 className="pf-section-title">{SECTION_LABELS.contact}</h3>
            <div className="row" style={{ marginTop: 0 }}>
              <a className="btn-primary" href={`mailto:${portfolio.email}`}>
                Contact {portfolio.name}
              </a>
            </div>
            {portfolio.phone && <p className="pf-meta">📞 {portfolio.phone}</p>}
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`pf pf-${theme}`} style={{ '--accent': accentColor }}>
      <header className="pf-hero">
        <div className="pf-avatar">{portfolio.avatarInitials}</div>
        <h1 className="pf-name">{portfolio.name}</h1>
        <p className="pf-headline">{portfolio.headline}</p>
        <p className="pf-meta">
          {[portfolio.course, yearLevelLabel(portfolio.yearLevel, portfolio.role), portfolio.section]
            .filter(Boolean)
            .join(' • ')}
        </p>
      </header>
      {visible.map(renderSection)}
      <footer className="pf-footer muted">MarSU Student Portfolio • {portfolio.slug}</footer>
    </div>
  );
}
