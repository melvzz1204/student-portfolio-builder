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
  const { openLogin, openSignup } = useAuthModal();
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
    <div className="flex min-h-screen flex-col bg-cream-50 font-sans text-burgundy-950 antialiased lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold-500 focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-burgundy-950"
      >
        Skip to content
      </a>

      <main id="main-content" className="flex min-h-0 flex-1 flex-col">
        <section
          aria-labelledby="split-heading"
          className="relative grid flex-1 lg:min-h-0 lg:grid-cols-2"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-burgundy-950 via-gold-400 to-burgundy-950"
          />

          {/* Brand panel */}
          <div className="relative flex min-h-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-burgundy-900 via-burgundy-900 to-burgundy-950 px-8 pb-8 pt-10 text-white sm:px-12 lg:overflow-y-auto lg:py-10 lg:pr-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-gold-400/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-12 right-0 hidden w-px bg-gradient-to-b from-transparent via-gold-400/50 to-transparent lg:block"
            />
            <div className="relative flex flex-1 flex-col items-center justify-center py-10 text-center">
              <p className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.26em] text-gold-300">
                <span aria-hidden="true" className="h-px w-8 bg-gold-400/70" />
                Marinduque State University
                <span aria-hidden="true" className="h-px w-8 bg-gold-400/70" />
              </p>

              <h1
                id="split-heading"
                className="mt-6 max-w-lg font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-balance text-white xl:text-5xl"
              >
                MarSU Student
                <span className="mt-1 block text-gold-400">Portfolio Builder</span>
              </h1>

              <span
                aria-hidden="true"
                className="mt-6 h-px w-16 bg-gradient-to-r from-transparent via-gold-400/70 to-transparent"
              />

              <p className="mt-6 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
                Turn your achievements into a portfolio that{' '}
                <span className="font-semibold text-white">speaks for you.</span>
              </p>
            </div>

            <div
              className="relative mt-8"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div
                aria-roledescription="carousel"
                aria-label="How it works"
                aria-live="polite"
                className="relative min-h-[140px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
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
                      <p className="mt-2 font-display text-xl font-bold text-white">{s.title}</p>
                      <p className="mt-2 line-clamp-2 max-w-sm text-sm leading-relaxed text-white/75">{s.text}</p>
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

              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/45">
                Marinduque State University
              </p>
            </div>
          </div>

          {/* Action panel */}
          <div className="relative flex min-h-0 flex-col justify-center bg-cream-50 px-8 py-8 sm:px-12 lg:overflow-y-auto lg:py-10 lg:pl-20">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-700">
              Get started
            </p>
            <h2 className="mt-4 max-w-md font-display text-2xl font-bold leading-snug text-burgundy-900">
              Your portfolio, ready in minutes.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-burgundy-700/80">
              Create your resume, upload your trainings and certificates, and share one public
              link with employers or OJT coordinators.
            </p>

            <div className="mt-8 flex flex-col flex-wrap items-start gap-4 sm:flex-row sm:items-center">
              <button type="button" onClick={openSignup} className={PRIMARY_BTN}>
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
