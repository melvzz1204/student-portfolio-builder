import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [mode, setMode] = useState(null); // null | 'login' | 'register'
  const openLogin = useCallback(() => setMode('login'), []);
  const openRegister = useCallback(() => setMode('register'), []);
  const close = useCallback(() => setMode(null), []);

  return (
    <AuthModalContext.Provider value={{ mode, openLogin, openRegister, close }}>
      {children}
      <AuthDialog mode={mode} onClose={close} onMode={setMode} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}

const TABS = [
  { id: 'login', label: 'Log in' },
  { id: 'register', label: 'Create account' },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function AuthDialog({ mode, onClose, onMode }) {
  const location = useLocation();
  const [render, setRender] = useState(false);
  const [visible, setVisible] = useState(false);
  const open = mode !== null;
  const prevFocus = useRef(null);
  const dialogRef = useRef(null);
  const pathRef = useRef(location.pathname);

  // Close the modal on navigation (e.g. after a successful login/register).
  useEffect(() => {
    if (pathRef.current !== location.pathname) {
      pathRef.current = location.pathname;
      onClose();
    }
  }, [location.pathname, onClose]);

  // Mount/unmount, enter transition, Escape/Tab trap, scroll lock, focus restore.
  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement;
      setRender(true);
      document.body.style.overflow = 'hidden';
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));

      const onKey = (e) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }
        if (e.key === 'Tab') {
          const node = dialogRef.current;
          if (!node) return;
          const focusable = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
            (el) => el.offsetParent !== null
          );
          if (focusable.length === 0) {
            e.preventDefault();
            return;
          }
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          const active = document.activeElement;
          if (e.shiftKey) {
            if (active === first || !node.contains(active)) {
              e.preventDefault();
              last.focus();
            }
          } else if (active === last || !node.contains(active)) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      window.addEventListener('keydown', onKey);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', onKey);
      };
    }
    if (render) {
      setVisible(false);
      document.body.style.overflow = '';
      if (prevFocus.current && prevFocus.current.focus) prevFocus.current.focus();
      const t = setTimeout(() => setRender(false), 200);
      return () => clearTimeout(t);
    }
  }, [open, onClose, render]);

  if (!render || !mode) return null;

  const isLogin = mode === 'login';

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-4 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-burgundy-950/75 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-desc"
        tabIndex={-1}
        className={`relative my-auto w-full overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-burgundy-950/5 transition-all duration-200 ${
          isLogin ? 'max-w-md' : 'max-w-2xl'
        } ${visible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}`}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-burgundy-800 to-burgundy-950 px-6 pb-6 pt-6 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gold-400/15 blur-2xl"
          />

          <div className="relative flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-400/15 font-display text-xl font-bold text-gold-300 ring-1 ring-gold-300/30"
            >
              M
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-200/90">
              MarSU Student Portfolio
            </span>
          </div>

          <h2
            id="auth-modal-title"
            className="relative mt-5 font-display text-[1.75rem] font-semibold uppercase leading-tight tracking-wide"
          >
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p id="auth-modal-desc" className="relative mt-1 text-sm text-white/70">
            {isLogin
              ? 'Sign in to manage your achievements and portfolio.'
              : 'Verify your MarSU Student ID to get started.'}
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-base leading-none text-white/80 transition-colors hover:border-gold-300 hover:bg-white/5 hover:text-gold-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
          >
            <span aria-hidden="true">✕</span>
          </button>

          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600"
          />
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1.5 border-b border-burgundy-100/70 bg-cream-50 px-6 pt-4"
          role="tablist"
          aria-label="Login or create account"
        >
          {TABS.map((tab) => {
            const active = (tab.id === 'login') === isLogin;
            return (
              <button
                key={tab.id}
                id={`auth-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="auth-panel"
                onClick={() => onMode(tab.id)}
                className={`flex-1 rounded-t-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-500 ${
                  active
                    ? 'bg-white text-burgundy-800 shadow-[0_-2px_10px_rgba(86,12,21,0.06)] ring-1 ring-burgundy-100/70 border-b-2 border-b-transparent'
                    : 'text-burgundy-500/70 hover:bg-burgundy-50 hover:text-burgundy-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div
          id="auth-panel"
          role="tabpanel"
          aria-labelledby={`auth-tab-${mode}`}
          className="auth-modal px-7 pb-8 pt-6"
        >
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => onMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => onMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
