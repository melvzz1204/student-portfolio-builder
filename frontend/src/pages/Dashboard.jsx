import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/users/profile')
      .then((res) => setProfile(res.data?.data?.user))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load profile'));
  }, []);

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <p className="muted">Welcome, {user?.name} ({user?.email})</p>
      {error && <p className="error">{error}</p>}
      {profile ? (
        <pre className="card">{JSON.stringify(profile, null, 2)}</pre>
      ) : (
        !error && <p>Loading profile...</p>
      )}
    </div>
  );
}
