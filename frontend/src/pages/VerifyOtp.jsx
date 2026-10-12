import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OTP_EXPIRY_MIN, RESEND_COOLDOWN_S } from '../utils/marsu';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export default function VerifyOtp() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [mockOtp, setMockOtp] = useState(params.get('mockOtp') || '');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const qEmail = params.get('email');
    if (qEmail) setEmail(qEmail);
  }, [params]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onVerify = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (otp.trim().length !== 6) {
      setError('Ilagay ang 6-digit OTP.');
      return;
    }
    setBusy(true);
    try {
      await verifyOtp(email, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Hindi ma-verify. Subukan ulit.');
    } finally {
      setBusy(false);
    }
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    setError('');
    setNotice('');
    try {
      const result = await resendOtp(email);
      setCooldown(RESEND_COOLDOWN_S);
      if (useMock && result?.mockOtp) {
        setMockOtp(result.mockOtp);
        setNotice(`Nag-send ulit ng OTP (valid ng ${OTP_EXPIRY_MIN} min).`);
      } else {
          setNotice('Nag-send ulit ng OTP. Pakitingnan ang email mo.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Hindi makapag-resend. Subukan ulit.');
    }
  };

  return (
    <div className="container narrow">
      <h2>Verify email</h2>
      <p className="muted">
        Nag-send kami ng 6-digit OTP sa <strong>{email || 'email address mo'}</strong> (valid ng{' '}
        {OTP_EXPIRY_MIN} min).
      </p>
      {useMock && mockOtp && (
        <p className="mock-hint">
          Mock mode — OTP mo: <strong>{mockOtp}</strong> (sa tunay na backend, via Resend email ito)
        </p>
      )}
      {notice && <p className="success">{notice}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={onVerify} className="form">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          inputMode="numeric"
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="otp-input"
          required
        />
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      <p className="muted">
        Walang natanggap?{' '}
        <button type="button" className="link-btn" onClick={onResend} disabled={cooldown > 0 || !email}>
          {cooldown > 0 ? `Resend OTP (${cooldown}s)` : 'Resend OTP'}
        </button>
      </p>
      <p className="muted">
        <Link to="/register">Bumalik sa register</Link>
      </p>
    </div>
  );
}
