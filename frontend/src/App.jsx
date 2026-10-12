import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthModalProvider } from './components/AuthModal';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Achievements from './pages/Achievements';
import Customize from './pages/Customize';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import PublicPortfolio from './pages/PublicPortfolio';
import Register from './pages/Register';
import Resume from './pages/Resume';
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/resume" element={<Resume />} />
            <Route path="/dashboard/achievements" element={<Achievements />} />
            <Route path="/dashboard/customize" element={<Customize />} />
          </Route>
          <Route path="/p/:slug" element={<PublicPortfolio />} />
          <Route path="*" element={<p className="center">404 — Not found</p>} />
        </Routes>
      </main>
      </div>
      </AuthModalProvider>
    </BrowserRouter>
  );
}
