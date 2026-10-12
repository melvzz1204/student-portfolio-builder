import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PortfolioView from '../components/portfolio/PortfolioView';
import { fetchMyPortfolio, updateMyPortfolio } from '../api/portfolio';
import { MOCK_PORTFOLIO } from '../data/mockPortfolio';
import {
  DEFAULT_SECTIONS,
  SECTION_LABELS,
  THEMES,
  loadSettings,
  saveSettings,
} from '../data/themes';

export default function Customize() {
  const [settings, setSettings] = useState(() => loadSettings());
  const [portfolio, setPortfolio] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMyPortfolio().then(setPortfolio).catch(() => {
      setPortfolio(MOCK_PORTFOLIO);
      setLoadError('Hindi ma-load ang tunay mong portfolio — sample preview muna ang ipinapakita.');
    });
  }, []);

  const update = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    setSaved('');
  };

  const toggleSection = (key) => {
    update({ showSections: { ...settings.showSections, [key]: !settings.showSections[key] } });
  };

  const moveSection = (index, dir) => {
    const order = [...settings.sectionOrder];
    const j = index + dir;
    if (j < 0 || j >= order.length) return;
    [order[index], order[j]] = [order[j], order[index]];
    update({ sectionOrder: order });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved('');
    try {
      await updateMyPortfolio(settings);
      saveSettings(settings);
      setSaved('Nai-save ang design mo.');
    } catch {
      saveSettings(settings);
      setSaved('Nai-save locally (mock mode). Ikokonekta sa backend mamaya.');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = `/p/${portfolio?.slug || MOCK_PORTFOLIO.slug}`;

  if (!portfolio) return <p className="center">Loading portfolio...</p>;

  return (
    <div className="container wide">
      <h2>Customize portfolio</h2>
      <p className="muted">
        Pumili ng theme, kulay, at ayos ng sections. Makikita agad ang preview sa ibaba — galing sa
        tunay mong resume at achievements. Public link: <Link to={publicUrl}>{publicUrl}</Link>
      </p>
      {loadError && <p className="error">{loadError}</p>}

      <div className="custom-grid">
        <div className="card">
          <h3>Theme</h3>
          <div className="theme-pick">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-card ${settings.theme === t.id ? 'active' : ''}`}
                onClick={() => update({ theme: t.id })}
              >
                <strong>{t.name}</strong>
                <span className="muted">{t.description}</span>
              </button>
            ))}
          </div>

          <h3>Accent color</h3>
          <div className="row">
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => update({ accentColor: e.target.value })}
            />
            <code>{settings.accentColor}</code>
          </div>

          <h3>Sections</h3>
          {settings.sectionOrder.map((key, i) => (
            <div key={key} className="section-row">
              <label>
                <input type="checkbox" checked={!!settings.showSections[key]} onChange={() => toggleSection(key)} />{' '}
                {SECTION_LABELS[key] || key}
              </label>
              <div className="row">
                <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(i, 1)}
                  disabled={i === settings.sectionOrder.length - 1}
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => update({ sectionOrder: [...DEFAULT_SECTIONS] })}>
            Reset order
          </button>

          <div className="row" style={{ marginTop: '1rem' }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save design'}
            </button>
            {saved && <span className="muted">{saved}</span>}
          </div>
        </div>

        <div>
          <h3>Live preview</h3>
          <PortfolioView portfolio={portfolio} settings={settings} />
        </div>
      </div>
    </div>
  );
}
