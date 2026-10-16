import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthModalProvider } from './components/AuthModal';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import GoogleCallback from './pages/GoogleCallback';
import Home from './pages/Home';
import VerifyOtp from './pages/VerifyOtp';

export default function App() {
  return (
    <BrowserRouter>
      <AuthModalProvider>
      <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<p className="center">404 — Not found</p>} />
        </Routes>
      </main>
      </div>
      </AuthModalProvider>
    </BrowserRouter>
  );
}
