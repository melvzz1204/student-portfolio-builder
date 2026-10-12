import api from './client';

export const CATEGORIES = ['certificate', 'training', 'award', 'seminar', 'other'];

export const CATEGORY_LABELS = {
  certificate: 'Certificate',
  training: 'Training',
  award: 'Award',
  seminar: 'Seminar',
  other: 'Other',
};

export const MAX_FILE_MB = 5;
export const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const STORAGE_KEY = 'mockAchievements';
// Panandaliang object URLs para sa preview ng in-upload na file (session lang).
const previewUrls = new Map();

function seed() {
  // Blangko sa umpisa — sariling uploads ng estudyante lang ang lalabas.
  // Ang sample data ay nasa MOCK_PORTFOLIO pa rin para sa demo public page (/p/demo).
  return [];
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } catch {
    return seed();
  }
}

function writeStore(items) {
  // Hindi mai-save ang File object sa localStorage — metadata lang.
  const serializable = items.map(({ _file, _previewUrl, ...rest }) => rest);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

function mockDelay(result) {
  return new Promise((resolve) => setTimeout(() => resolve(result), 250));
}

export function getPreviewUrl(item) {
  if (item._previewUrl) return item._previewUrl;
  if (item._id && previewUrls.has(item._id)) return previewUrls.get(item._id);
  return item.fileUrl || null;
}

export async function listAchievements() {
  if (useMock) {
    const items = readStore().map((a) => ({
      ...a,
      _previewUrl: previewUrls.get(a._id) || undefined,
    }));
    return mockDelay(items);
  }
  const { data } = await api.get('/achievements');
  return data?.data?.achievements || data?.data || [];
}

export async function createAchievement({ title, category, issuer, dateReceived, description, proofType, file, proofUrl }) {
  if (useMock) {
    const items = readStore();
    const id = `m${Date.now()}`;
    const record = {
      _id: id,
      title,
      category,
      issuer: issuer || '',
      dateReceived: dateReceived || new Date().toISOString().slice(0, 10),
      description: description || '',
      proofType,
      ...(proofType === 'url'
        ? { proofUrl }
        : {
            fileName: file?.name || '',
            fileSize: file?.size || 0,
            fileType: file?.type || '',
            fileUrl: null,
          }),
    };
    if (proofType === 'file' && file) {
      previewUrls.set(id, URL.createObjectURL(file));
      record._previewUrl = previewUrls.get(id);
    }
    items.unshift(record);
    writeStore(items);
    return mockDelay({ ...record });
  }
  const form = new FormData();
  form.append('title', title);
  form.append('category', category);
  if (issuer) form.append('issuer', issuer);
  if (dateReceived) form.append('dateReceived', dateReceived);
  if (description) form.append('description', description);
  form.append('proofType', proofType);
  if (proofType === 'url') form.append('proofUrl', proofUrl);
  else if (file) form.append('file', file);
  const { data } = await api.post('/achievements', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.data?.achievement || data?.data;
}

export async function updateAchievement(id, { title, category, issuer, dateReceived, description, proofType, file, proofUrl }) {
  if (useMock) {
    const items = readStore().map((a) => {
      if (a._id !== id) return a;
      const next = {
        ...a,
        title,
        category,
        issuer: issuer || '',
        dateReceived: dateReceived || a.dateReceived,
        description: description || '',
        proofType,
      };
      if (proofType === 'url') {
        next.proofUrl = proofUrl;
        delete next.fileName;
        delete next.fileSize;
        delete next.fileType;
      } else if (file) {
        next.fileName = file.name;
        next.fileSize = file.size;
        next.fileType = file.type;
        delete next.proofUrl;
        previewUrls.set(id, URL.createObjectURL(file));
        next._previewUrl = previewUrls.get(id);
      }
      return next;
    });
    writeStore(items);
    const updated = items.find((a) => a._id === id);
    return mockDelay({ ...updated, _previewUrl: previewUrls.get(id) });
  }
  const form = new FormData();
  form.append('title', title);
  form.append('category', category);
  if (issuer) form.append('issuer', issuer);
  if (dateReceived) form.append('dateReceived', dateReceived);
  if (description) form.append('description', description);
  form.append('proofType', proofType);
  if (proofType === 'url') form.append('proofUrl', proofUrl);
  else if (file) form.append('file', file);
  const { data } = await api.put(`/achievements/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.data?.achievement || data?.data;
}

export async function deleteAchievement(id) {
  if (useMock) {
    writeStore(readStore().filter((a) => a._id !== id));
    previewUrls.delete(id);
    return mockDelay({ ok: true });
  }
  const { data } = await api.delete(`/achievements/${id}`);
  return data;
}
