import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../api/profile';
import { yearLevelLabel } from '../utils/marsu';

// Slim dashboard for the Google-login-first milestone.
// Resume, achievements, customization, and the public page are parked for later.
export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const roleLabel = profile?.role === 'alumni' ? 'Alumnus / Alumna' : 'Student';

  return (
    <div className="container wide">
      <div className="page-head">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">Welcome, {user?.name || profile?.name}</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="card">
          <div className="page-head">
            <h3 style={{ margin: 0 }}>{profile?.name}</h3>
            <span className="muted">{roleLabel}</span>
          </div>
          <p className="muted">
            {[profile?.course, yearLevelLabel(profile?.yearLevel, profile?.role), profile?.email]
              .filter(Boolean)
              .join(' • ')}
          </p>
          <p className="muted" style={{ marginBottom: 0 }}>
            Resume, achievements, and portfolio customization are coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
