import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from './AuthModal';

function MarsuCrest() {
  return (
    <img
      src="/marsu-logo.png"
      alt="MarSU logo"
      className="h-14 w-14 shrink-0 rounded-full bg-white object-cover shadow-[0_4px_14px_rgba(201,162,39,0.45)] ring-2 ring-gold-300"
    />
  );
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { openLogin, openSignup } = useAuthModal();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open ]);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50">
      <nav
        aria-label="MarSU primary navigation"
        className={`bg-burgundy-800/95 text-white backdrop-blur transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_10px_30px_rgba(43,6,11,0.35)]' : 'shadow-md'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-300" aria-label="MarSU — back to home">
            <MarsuCrest />
            <span className="leading-tight">
              <span className="block font-display text-2xl font-bold uppercase tracking-wide">
                Mar<span className="text-gold-400">SU</span>
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-white/75 group-hover:text-white">
                Marinduque State University
              </span>
            </span>
          </Link>

          {/* Desktop auth */}
          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-full px-3 py-2 text-sm font-semibold text-gold-300 transition-colors hover:bg-white/10 hover:text-gold-200 focus-visible:outline-2 focus-visible:outline-gold-300"
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/resume"
                  className="rounded-full px-3 py-2 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-gold-300"
                >
                  Resume
                </Link>
                <Link
                  to="/dashboard/achievements"
                  className="rounded-full px-3 py-2 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-gold-300"
                >
                  Achievements
                </Link>
                <span className="max-w-28 truncate text-xs text-white/70">{user?.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition-all hover:border-gold-300 hover:text-gold-200 focus-visible:outline-2 focus-visible:outline-gold-300"
                >
                  Logout
                </button>
                <Link
                  to="/register"
                  className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-burgundy-950 shadow-[0_6px_20px_rgba(201,162,39,0.4)] transition-all hover:-translate-y-0.5 hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-200"
                >
                  Portfolio
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openLogin}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-gold-300"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={openSignup}
                  className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-burgundy-950 shadow-[0_6px_20px_rgba(201,162,39,0.4)] transition-all hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-[0_10px_28px_rgba(201,162,39,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-200"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="marsu-mobile-menu"
            aria-label={open ? 'Close the menu' : 'Open the menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-gold-300 lg:hidden"
          >
            <span className="sr-only">{open ? 'Close' : 'Open'} the menu</span>
            <span aria-hidden="true" className="relative block h-5 w-6">
              <span
                className={`absolute left-0 top-0 h-0.5 w-full rounded bg-current transition-transform duration-300 ${
                  open ? 'translate-y-[9px] rotate-45' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-[9px] h-0.5 w-full rounded bg-current transition-opacity duration-300 ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-full rounded bg-current transition-transform duration-300 ${
                  open ? '-translate-y-[9px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>

        {/* Gold hairline */}
        <div aria-hidden="true" className="h-[3px] bg-gradient-to-r via-gold-300 from-burgundy-950 from-0% to-burgundy-950 to-100%" />

        {/* Mobile menu */}
        <div
          id="marsu-mobile-menu"
          className={`overflow-hidden border-t border-white/10 transition-[max-height,opacity] duration-300 ease-out lg:hidden ${
            open ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-1 bg-burgundy-900 px-4 py-4 sm:px-6">
            <div className="grid grid-cols-2 gap-2 pt-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-white/10 px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/resume"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-white/10 px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Resume
                  </Link>
                  <Link
                    to="/dashboard/achievements"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-white/10 px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Achievements
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-white/25 px-4 py-3 text-sm font-bold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openLogin();
                    }}
                    className="rounded-xl border border-white/25 px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openSignup();
                    }}
                    className="rounded-xl bg-gold-500 px-4 py-3 text-center text-sm font-bold text-burgundy-950"
                  >
                    Apply Now
                  </button>
                </>
              )}
            </div>
            <p className="px-1 pt-3 text-center text-xs text-white/60">
              Boac • Mogpog • Sta. Cruz • Torrijos • Gasan
            </p>
          </div>
        </div>
      </nav>
    </header>
  );
}
