import { useCallback, useEffect, useState } from 'react';
import { useAuthModal } from '../components/AuthModal';

const steps = [
  {
    title: 'Build your resume',
    text: 'Add your headline, bio, skills, and education.',
  },
  {
    title: 'Upload your proof',
    text: 'Trainings, certificates, and awards PDF or image, up to 5MB.',
  },
  {
    title: 'Share one link',
    text: 'Send your public portfolio page to employers and OJT coordinators.',
  },
];

const PRIMARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-full bg-burgundy-800 px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(86,12,21,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-burgundy-700 hover:shadow-[0_12px_30px_rgba(86,12,21,0.34)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy-500';
const LINK_BTN =
  'inline-flex items-center justify-center gap-2 rounded-full border-2 border-burgundy-800 bg-transparent px-7 py-3 text-sm font-bold text-burgundy-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-burgundy-800 hover:text-white hover:shadow-[0_8px_24px_rgba(86,12,21,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy-500';

export default function Home() {
  const { openLogin, openRegister } = useAuthModal();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i) => {
    setActive(((i % steps.length) + steps.length) % steps.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div className="min-h-screen bg-cream-50 font-sans text-burgundy-950 antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold-500 focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-burgundy-950"
      >
        Skip to content
      </a>

      <main id="main-content">
        <section
          aria-labelledby="split-heading"
          className="relative grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-burgundy-950 via-gold-400 to-burgundy-950"
          />

          {/* Brand panel */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-burgundy-900 via-burgundy-900 to-burgundy-950 px-8 pb-14 pt-16 text-white sm:px-12 lg:py-20 lg:pr-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-gold-400/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-12 right-0 hidden w-px bg-gradient-to-b from-transparent via-gold-400/50 to-transparent lg:block"
            />
            <div className="relative">
              <p className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-white/60">
                <span aria-hidden="true" className="h-px w-8 bg-gold-400" />
                Student Portfolio Builder
              </p>

              <h1
                id="split-heading"
                className="mt-4 max-w-md font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-balance lg:text-5xl"
              >
                Turn your achievements into a portfolio that{' '}
                <span className="text-gold-400">speaks for you.</span>
              </h1>
            </div>

            <div
              className="relative mt-12"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div
                aria-roledescription="carousel"
                aria-label="How it works"
                aria-live="polite"
                className="relative min-h-[168px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:min-h-[152px]"
              >
                {steps.map((s, i) => {
                  const isActive = i === active;
                  return (
                    <div
                      key={s.title}
                      aria-hidden={!isActive}
                      aria-roledescription="slide"
                      className={`absolute inset-0 p-6 transition-all duration-500 ease-out ${
                        isActive
                          ? 'translate-x-0 opacity-100'
                          : i < active || (active === 0 && i === steps.length - 1)
                            ? 'pointer-events-none -translate-x-6 opacity-0'
                            : 'pointer-events-none translate-x-6 opacity-0'
                      }`}
                    >
                      <p className="font-display text-sm font-bold tracking-[0.2em] text-gold-400">
                        0{i + 1}
                      </p>
                      <p className="mt-2 font-display text-2xl font-bold text-white">{s.title}</p>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/75">{s.text}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {steps.map((s, i) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Go to step ${i + 1}: ${s.title}`}
                      aria-current={i === active}
                      className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-gold-300 ${
                        i === active ? 'w-8 bg-gold-400' : 'w-2 bg-white/25 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="mr-1 font-display text-xs font-bold tracking-widest text-white/50">
                    0{active + 1} / 0{steps.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => goTo(active - 1)}
                    aria-label="Previous step"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-gold-300"
                  >
                    <span aria-hidden="true">←</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(active + 1)}
                    aria-label="Next step"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 font-bold text-burgundy-950 transition-all hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-200"
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>

              <p className="mt-6 text-xs uppercase tracking-[0.2em] text-white/45">
                Marinduque State University
              </p>
            </div>
          </div>

          {/* Action panel */}
          <div className="relative flex flex-col justify-center bg-cream-50 px-8 py-16 sm:px-12 lg:py-20 lg:pl-20">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-700">
              Get started
            </p>
            <h2 className="mt-4 max-w-md font-display text-2xl font-bold leading-snug text-burgundy-900 sm:text-3xl">
              Your portfolio, ready in minutes.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-burgundy-700/80">
              Create your resume, upload your trainings and certificates, and share one public
              link with employers or OJT coordinators.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button type="button" onClick={openRegister} className={PRIMARY_BTN}>
                Create a free account
                <span aria-hidden="true">→</span>
              </button>
              <button type="button" onClick={openLogin} className={LINK_BTN}>
                Log in
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
