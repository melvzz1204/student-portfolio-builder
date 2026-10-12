import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../api/profile';
import { listAchievements } from '../api/achievements';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [achCount, setAchCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      // Sa real mode, gamitin ang backend profile endpoint.
      useMock ? getMyProfile() : api.get('/users/profile').then((r) => r.data?.data?.user),
      listAchievements().catch(() => []),
    ])
      .then(([p, achs]) => {
        setProfile(p);
        setAchCount(Array.isArray(achs) ? achs.length : 0);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const steps = [
    { label: 'Gumawa ng resume (headline + bio)', done: !!(profile?.headline && profile?.bio), to: '/dashboard/resume' },
    { label: 'Magdagdag ng skills', done: (profile?.skills?.length || 0) > 0, to: '/dashboard/resume' },
    { label: 'Magdagdag ng education', done: (profile?.education?.length || 0) > 0, to: '/dashboard/resume' },
    { label: 'Mag-upload ng unang achievement', done: achCount > 0, to: '/dashboard/achievements' },
    { label: 'I-customize at i-share ang portfolio', done: profile?.isPublic !== false && achCount > 0, to: '/dashboard/customize' },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="container wide">
      <div className="page-head">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">
            Welcome, {user?.name} ({user?.studentId || user?.email})
          </p>
        </div>
        <Link to={`/p/${profile?.slug || 'demo'}`} className="btn-secondary">
          View public page ↗
        </Link>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div className="card">
            <div className="page-head">
              <h3 style={{ margin: 0 }}>Portfolio completion — {pct}%</h3>
              <span className="muted">
                {doneCount}/{steps.length} steps
              </span>
            </div>
            <div
              aria-hidden="true"
              style={{ height: 10, borderRadius: 999, background: '#eee', overflow: 'hidden', marginTop: '0.5rem' }}
            >
              <div style={{ height: '100%', width: `${pct}%`, background: '#6b0f1a', transition: 'width 0.4s' }} />
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
              {steps.map((s) => (
                <li key={s.label} className="section-row">
                  <span>
                    {s.done ? '✅' : '⬜'} {s.label}
                  </span>
                  {!s.done && <Link to={s.to}>Gawin →</Link>}
                </li>
              ))}
            </ul>
          </div>

          <div className="ach-list" style={{ marginTop: '1rem' }}>
            <div className="card">
              <h3 style={{ margin: '0 0 0.25rem' }}>{achCount}</h3>
              <p className="muted" style={{ margin: 0 }}>Achievements uploaded</p>
              <div className="row">
                <Link to="/dashboard/achievements" className="btn-primary">
                  My achievements
                </Link>
              </div>
            </div>
            <div className="card">
              <h3 style={{ margin: '0 0 0.25rem' }}>{profile?.skills?.length || 0}</h3>
              <p className="muted" style={{ margin: 0 }}>Skills sa resume</p>
              <div className="row">
                <Link to="/dashboard/resume" className="btn-primary">
                  Edit resume
                </Link>
              </div>
            </div>
            <div className="card">
              <h3 style={{ margin: '0 0 0.25rem' }}>{profile?.isPublic === false ? 'Private' : 'Public'}</h3>
              <p className="muted" style={{ margin: 0 }}>Portfolio visibility</p>
              <div className="row">
                <Link to="/dashboard/customize" className="btn-secondary">
                  Customize design
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
