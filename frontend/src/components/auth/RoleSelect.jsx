import { useId } from 'react';

// The first step of sign-up: is the visitor a current student or an alumnus?
// The choice decides which registration form we show next.
const OPTIONS = [
  {
    id: 'student',
    label: 'Current student',
    desc: 'I am still enrolled and taking classes at MarSU.',
    Icon: StudentIcon,
  },
  {
    id: 'alumni',
    label: 'Alumnus / Alumna',
    desc: 'I have already graduated from MarSU.',
    Icon: AlumniIcon,
  },
];

function StudentIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 4 2 9l10 5 10-5-10-5Z" />
      <path d="M6 11v5c0 1.2 2.7 2.2 6 2.2s6-1 6-2.2v-5" />
      <path d="M22 9v5" />
    </svg>
  );
}

function AlumniIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M8 8h8" />
      <path d="M8 12h5" />
      <circle cx="15.5" cy="16.5" r="2" />
    </svg>
  );
}

export default function RoleSelect({ onChoose, onSwitchToLogin }) {
  const headingId = useId();

  return (
    <div>
      <h3
        id={headingId}
        className="text-[1.05rem] font-semibold leading-snug text-burgundy-950"
      >
        Are you a current student or an alumnus?
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-burgundy-950/55">
        Choose the one that fits you best. It decides the details we&apos;ll ask for next.
      </p>

      <div
        role="group"
        aria-labelledby={headingId}
        className="mt-5 flex flex-col gap-3"
      >
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChoose(opt.id)}
            className="group flex items-center gap-4 rounded-2xl border border-burgundy-950/10 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-[0_14px_30px_-18px_rgba(43,6,11,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          >
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-burgundy-700 ring-1 ring-burgundy-950/[0.06] transition-colors duration-200 group-hover:bg-gold-100 group-hover:text-burgundy-900"
            >
              <opt.Icon className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.95rem] font-semibold text-burgundy-950">
                {opt.label}
              </span>
              <span className="mt-0.5 block text-sm text-burgundy-950/55">{opt.desc}</span>
            </span>
            <span
              aria-hidden="true"
              className="ml-auto shrink-0 text-lg text-burgundy-950/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-gold-600"
            >
              →
            </span>
          </button>
        ))}
      </div>

      <p className="muted">
        Already have an account?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToLogin}>
          Log in
        </button>
      </p>
    </div>
  );
}
