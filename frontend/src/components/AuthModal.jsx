import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import LoginForm from "./auth/LoginForm";
import RegisterForm from "./auth/RegisterForm";
import RoleSelect from "./auth/RoleSelect";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [mode, setMode] = useState(null); // null | 'login' | 'register' | 'role'
  const [role, setRole] = useState(null); // null | 'student' | 'alumni'

  const openLogin = useCallback(() => {
    setRole(null);
    setMode("login");
  }, []);
  // Entry point for every "sign up" call to action: ask the role first.
  const openSignup = useCallback(() => {
    setRole(null);
    setMode("role");
  }, []);
  const openRegister = useCallback((nextRole = "student") => {
    setRole(nextRole);
    setMode("register");
  }, []);
  const chooseRole = useCallback((nextRole) => {
    setRole(nextRole);
    setMode("register");
  }, []);
  const close = useCallback(() => {
    setMode(null);
    setRole(null);
  }, []);
  const switchMode = useCallback((next) => {
    if (next === "login") setRole(null);
    if (next === "register") setRole((current) => current || "student");
    setMode(next);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{
        mode,
        role,
        openLogin,
        openRegister,
        openSignup,
        chooseRole,
        close,
      }}
    >
      {children}
      <AuthDialog
        mode={mode}
        role={role}
        onClose={close}
        onMode={switchMode}
        onChooseRole={chooseRole}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx)
    throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}

const TABS = [
  { id: "login", label: "Log in" },
  { id: "register", label: "Create account" },
];

const HEADINGS = {
  login: {
    title: "Welcome back",
    desc: "Sign in to manage your achievements and portfolio.",
  },
  role: {},
  student: {
    title: "Create your account",
    desc: "It only takes a minute. Your Student ID confirms you're a MarSU student.",
  },
  alumni: {
    title: "Create your alumni account",
    desc: "It only takes a minute. We will ask for your former Student ID and graduation year.",
  },
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function AuthDialog({ mode, role, onClose, onMode, onChooseRole }) {
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
      document.body.style.overflow = "hidden";
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );

      const onKey = (e) => {
        if (e.key === "Escape") {
          onClose();
          return;
        }
        if (e.key === "Tab") {
          const node = dialogRef.current;
          if (!node) return;
          const focusable = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
            (el) => el.offsetParent !== null,
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

      window.addEventListener("keydown", onKey);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("keydown", onKey);
      };
    }
    if (render) {
      setVisible(false);
      document.body.style.overflow = "";
      if (prevFocus.current && prevFocus.current.focus)
        prevFocus.current.focus();
      const t = setTimeout(() => setRender(false), 200);
      return () => clearTimeout(t);
    }
  }, [open, onClose, render]);

  if (!render || !mode) return null;

  const isLogin = mode === "login";
  const isRole = mode === "role";
  const heading = isLogin
    ? HEADINGS.login
    : isRole
      ? HEADINGS.role
      : HEADINGS[role] || HEADINGS.student;
  const panelWidth = isLogin || isRole ? "max-w-md" : "max-w-2xl";

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-burgundy-950/35 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        {...(heading.title ? { "aria-labelledby": "auth-modal-title" } : {})}
        {...(heading.desc ? { "aria-describedby": "auth-modal-desc" } : {})}
        tabIndex={-1}
        className={`relative my-auto w-full overflow-hidden rounded-[26px] bg-white shadow-[0_24px_70px_-24px_rgba(43,6,11,0.5)] ring-1 ring-burgundy-950/[0.06] transition-all duration-200 ${panelWidth} ${
          visible ? "translate-y-0 scale-100" : "translate-y-2 scale-[0.98]"
        }`}
      >
        <div
          aria-hidden="true"
          className="h-1 bg-gradient-to-r from-gold-400/0 via-gold-400/70 to-gold-400/0"
        />

        <div className="px-6 pt-6 sm:px-8 sm:pt-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/marsu-logo.png"
                alt=""
                className="h-9 w-9 rounded-full object-cover ring-1 ring-burgundy-950/10"
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-burgundy-950/45">
                MarSU Portfolio
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-burgundy-950/40 transition-colors hover:bg-burgundy-50 hover:text-burgundy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {heading.title && (
            <h2
              id="auth-modal-title"
              className="mt-6 font-display text-[1.6rem] font-semibold leading-tight tracking-tight text-burgundy-950"
            >
              {heading.title}
            </h2>
          )}
          {heading.desc && (
            <p
              id="auth-modal-desc"
              className="mt-1.5 text-sm leading-relaxed text-burgundy-950/55"
            >
              {heading.desc}
            </p>
          )}

          {!isRole && (
            <div
              role="tablist"
              aria-label="Login or create account"
              className="mt-5 flex gap-1 rounded-full bg-burgundy-50/80 p-1"
            >
              {TABS.map((tab) => {
                const active = (tab.id === "login") === isLogin;
                return (
                  <button
                    key={tab.id}
                    id={`auth-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="auth-panel"
                    onClick={() => onMode(tab.id)}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${
                      active
                        ? "bg-white text-burgundy-900 shadow-[0_2px_10px_rgba(43,6,11,0.09)]"
                        : "text-burgundy-950/55 hover:text-burgundy-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel */}
        <div
          id="auth-panel"
          role={isRole ? undefined : "tabpanel"}
          aria-labelledby={isRole ? undefined : `auth-tab-${mode}`}
          className="auth-modal px-6 pb-7 pt-6 sm:px-8"
        >
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => onMode("register")} />
          ) : isRole ? (
            <RoleSelect
              onChoose={onChooseRole}
              onSwitchToLogin={() => onMode("login")}
            />
          ) : (
            <RegisterForm
              key={role || "student"}
              role={role || "student"}
              onSwitchToLogin={() => onMode("login")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
