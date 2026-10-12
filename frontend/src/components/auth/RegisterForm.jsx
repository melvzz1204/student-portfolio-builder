import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PasswordToggle from './PasswordToggle';
import { COURSES, YEAR_LEVELS, STUDENT_ID_EXAMPLE, isValidEmail, isValidStudentId, normalizeStudentId } from '../../utils/marsu';

export default function RegisterForm({ onSwitchToLogin }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    course: 'BSIT',
    yearLevel: '1st',
    section: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(form.email)) {
      setError('Enter a valid email address — any email works.');
      return;
    }
    if (!isValidStudentId(form.studentId)) {
      setError(
        `Enter a valid MarSU Student ID (e.g. ${STUDENT_ID_EXAMPLE}) — this verifies you're a MarSU student.`
      );
      return;
    }
    if (!form.section.trim()) {
      setError('Enter your section.');
      return;
    }
    setBusy(true);
    try {
      const result = await register({ ...form, studentId: normalizeStudentId(form.studentId) });
      if (result?.needsVerification) {
        const q = new URLSearchParams({ email: result.email });
        if (result.mockOtp) q.set('mockOtp', result.mockOtp);
        navigate(`/verify-otp?${q.toString()}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <p className="auth-hint">
        Your Student ID verifies you're a MarSU student.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <form onSubmit={onSubmit} className="form" noValidate>
        <div className="auth-form-grid">
          <label>
            <span className="field-label">Full name</span>
            <input
              autoFocus
              autoComplete="name"
              placeholder="Juan Dela Cruz"
              value={form.name}
              onChange={set('name')}
              required
            />
          </label>
          <label>
            <span className="field-label">Email address</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@gmail.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </label>
          <label>
            <span className="field-label">Password</span>
            <span className="pw-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
              />
              <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />
            </span>
          </label>
          <label>
            <span className="field-label">Student ID</span>
            <input
              autoComplete="off"
              placeholder={`e.g. ${STUDENT_ID_EXAMPLE}`}
              value={form.studentId}
              onChange={set('studentId')}
              required
            />
          </label>
          <label>
            <span className="field-label">Course</span>
            <select value={form.course} onChange={set('course')}>
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Year level</span>
            <select value={form.yearLevel} onChange={set('yearLevel')}>
              {YEAR_LEVELS.map((y) => (
                <option key={y} value={y}>
                  {y} Year
                </option>
              ))}
            </select>
          </label>
          <label className="auth-col-span">
            <span className="field-label">Section</span>
            <input
              autoComplete="off"
              placeholder="e.g. BSIT-2A"
              value={form.section}
              onChange={set('section')}
              required
            />
          </label>
        </div>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p className="muted">
        Already have an account?{' '}
        {onSwitchToLogin ? (
          <button type="button" className="link-btn" onClick={onSwitchToLogin}>
            Login
          </button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </p>
    </>
  );
}
