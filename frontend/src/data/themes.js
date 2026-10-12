export const THEMES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Malines na serif header, centered — pang-formal na portfolio.',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Gradient hero + grid cards — pang-tech at creatives.',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Maputing espasyo, manipis na dividers — malinis tingnan.',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Madilim na background, malaking typography — standout.',
  },
];

export const DEFAULT_SECTIONS = ['about', 'achievements', 'education', 'contact'];

export const SECTION_LABELS = {
  about: 'About',
  achievements: 'Achievements',
  education: 'Education',
  contact: 'Contact',
};

export const DEFAULT_PORTFOLIO_SETTINGS = {
  theme: 'modern',
  accentColor: '#4f46e5',
  sectionOrder: [...DEFAULT_SECTIONS],
  showSections: { about: true, achievements: true, education: true, contact: true },
  isPublic: true,
};

const SETTINGS_KEY = 'portfolioSettings';

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_PORTFOLIO_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PORTFOLIO_SETTINGS,
      ...parsed,
      showSections: { ...DEFAULT_PORTFOLIO_SETTINGS.showSections, ...(parsed.showSections || {}) },
    };
  } catch {
    return { ...DEFAULT_PORTFOLIO_SETTINGS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
