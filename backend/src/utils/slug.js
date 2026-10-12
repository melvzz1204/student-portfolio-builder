// Gumawa ng URL-friendly slug mula sa pangalan (hal. "Juan Dela Cruz" -> "juan-dela-cruz").
// May random suffix para iwas-duplicate; ang caller ang mag-verify ng uniqueness sa DB.
function slugify(text) {
  const base = String(text || 'student')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return base || 'student';
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 7);
}

function buildSlug(name) {
  return `${slugify(name)}-${randomSuffix()}`;
}

module.exports = { slugify, buildSlug };
