import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="container">
      <h1>Student Portfolio Builder</h1>
      <p className="muted">
        Vite + React + Express + JWT starter. Register, log in, and hit the protected API.
      </p>
      <div className="row">
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link to="/register" className="btn-primary">
              Get started
            </Link>
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
