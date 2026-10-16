const API_BASE = import.meta.env.VITE_API_URL || '/api';
const useMock = import.meta.env.VITE_USE_MOCK === 'true';

function GoogleLogo(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.6 21.3 7.5 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8-.1.1C.5 8.7 0 10.3 0 12s.5 3.3 1.4 4.7l3.8-2.3z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.6 2.7 1.4 6.7l3.8 2.9c.9-2.7 3.6-4.9 6.8-4.9z"
      />
    </svg>
  );
}

// Redirect-based OAuth: the backend starts the Google flow and redirects back
// to /auth/callback?token=<accessToken>. New Google users get an account
// created automatically, so this also serves as Google sign-up.
export default function GoogleSignInButton() {
  if (useMock) {
    return (
      <button
        type="button"
        disabled
        title="Connect the backend to enable Google sign-in"
        className="google-btn"
      >
        <GoogleLogo className="google-logo" />
        Continue with Google
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = `${API_BASE}/auth/google`;
      }}
      className="google-btn"
    >
      <GoogleLogo className="google-logo" />
      Continue with Google
    </button>
  );
}
