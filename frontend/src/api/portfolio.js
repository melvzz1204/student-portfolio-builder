import api from './client';
import { MOCK_PORTFOLIO } from '../data/mockPortfolio';
import { listAchievements } from './achievements';
import { avatarInitials, getMyProfile } from './profile';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

function mockDelay(result, ms = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(result), ms));
}

function notFound() {
  const err = new Error('Portfolio not found');
  err.response = { status: 404, data: { message: 'Portfolio not found' } };
  return err;
}

// GET /api/portfolios/me (owner) — profile + tunay na achievements ng user
export async function fetchMyPortfolio() {
  if (useMock) {
    const [profile, achievements] = await Promise.all([getMyProfile(), listAchievements()]);
    return mockDelay({ ...profile, avatarInitials: avatarInitials(profile.name), achievements });
  }
  const { data } = await api.get('/portfolios/me');
  return data?.data?.portfolio || data?.data;
}

// GET /api/portfolios/:slug (public)
export async function fetchPublicPortfolio(slug) {
  if (useMock) {
    const clean = String(slug || '').toLowerCase();
    try {
      const portfolio = await fetchMyPortfolio();
      // Sariling portfolio (o demo) — ipakita ang tunay na datos ng user.
      if (clean === String(portfolio.slug).toLowerCase() || clean === 'demo') {
        if (portfolio.isPublic === false && clean !== String(portfolio.slug).toLowerCase()) {
          throw notFound();
        }
        return portfolio;
      }
    } catch (err) {
      if (err.response?.status === 404) throw err;
      // Walang naka-login — ipakita ang sample portfolio para sa demo slugs.
    }
    if (clean === MOCK_PORTFOLIO.slug || clean === 'demo') {
      return mockDelay({ ...MOCK_PORTFOLIO });
    }
    throw notFound();
  }
  const { data } = await api.get(`/portfolios/${slug}`);
  return data?.data?.portfolio || data?.data;
}

// PUT /api/portfolios/me — sa ngayon design settings lang (localStorage); naka-echo sa mock.
export async function updateMyPortfolio(payload) {
  if (useMock) return mockDelay({ ...payload });
  const { data } = await api.put('/portfolios/me', payload);
  return data?.data?.portfolio || data?.data;
}
