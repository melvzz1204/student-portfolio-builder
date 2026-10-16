import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <p className="center">Loading...</p>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}
