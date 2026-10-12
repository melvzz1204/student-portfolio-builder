import { useAuthModal } from '../components/AuthModal';

const steps = [
  {
    icon: '📄',
    title: 'Build your resume',
    text: 'Add your headline, bio, skills, and education.',
  },
  {
    icon: '📎',
    title: 'Upload your proof',
    text: 'Trainings, certificates, and awards — PDF or image, up to 5MB.',
  },
  {
    icon: '🔗',
    title: 'Share one link',
    text: 'Send your public portfolio page to employers and OJT coordinators.',
  },
];

export default function Home() {
  const { openLogin, openRegister } = useAuthModal();

  return (
    <div className="min-h-screen bg-burgundy-900 font-sans text-white antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold-500 focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-burgundy-950"
      >
        Skip to content
      </a>

      <main id="main-content">
        <section aria-labelledby="hero-heading" className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-burgundy-700/60 blur-3xl" />
            <div className="absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-burgundy-950 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #f2cd55 1px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20 lg:pb-24">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold-400" />
              MarSU · Student Portfolio Builder
            </p>
            <h1
              id="hero-heading"
              className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl"
            >
              Turn your achievements into a portfolio that <span className="text-gold-400">speaks for you.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              Built for MarSU students — create your resume, upload your trainings and
              certificates, and share one public link with employers and OJT coordinators.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openRegister}
                className="inline-flex items-center justify-center rounded-full bg-gold-500 px-8 py-3.5 text-sm font-bold text-burgundy-950 shadow-[0_10px_30px_rgba(201,162,39,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-200"
              >
                Create a free account →
              </button>
              <button
                type="button"
                onClick={openLogin}
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur transition-all duration-300 hover:border-gold-300 hover:text-gold-200 focus-visible:outline-2 focus-visible:outline-gold-300"
              >
                Log in
              </button>
            </div>

            <ul className="mt-12 grid gap-4 text-left sm:grid-cols-3">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className="rounded-3xl bg-white p-6 text-stone-900 shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <span aria-hidden="true" className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-burgundy-800 text-xl">
                    {s.icon}
                  </span>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-gold-700">Step {i + 1}</p>
                  <h2 className="mt-1 font-display text-lg font-bold text-burgundy-900">{s.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{s.text}</p>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-sm text-white/60">
              Free for MarSU students — a valid Student ID is required at registration.
            </p>
          </div>
          <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600" />
        </section>
      </main>
    </div>
  );
}
