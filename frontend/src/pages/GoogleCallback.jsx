import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Landing page for the backend Google OAuth redirect:
// /auth/callback?token=<accessToken> (or ?error=... on failure).
export default function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeGoogleLogin } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.get('error')) {
      setError('Google sign-in was cancelled or failed. Please try again.');
      return;
    }
    const token = params.get('token');
    if (!token) {
      setError('Missing sign-in token. Please try again.');
      return;
    }
    let cancelled = false;
    completeGoogleLogin(token)
      .then(() => {
        if (!cancelled) navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        if (!cancelled) setError('Could not complete Google sign-in. Please try again.');
      });
    return () => {
      cancelled = true;
    };
  }, [params, completeGoogleLogin, navigate]);

  return (
    <div className="container narrow">
      <h2>Google sign-in</h2>
      {error ? (
        <>
          <p className="error" role="alert">
            {error}
          </p>
          <p className="muted">
            <Link to="/">Back to home</Link>
          </p>
        </>
      ) : (
        <p className="muted">Signing you in with Google — please wait…</p>
      )}
    </div>
  );
}
