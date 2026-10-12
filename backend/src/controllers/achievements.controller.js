const Achievement = require('../models/Achievement');
const { CATEGORIES } = require('../models/Achievement');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { removeUpload } = require('../middleware/upload.middleware');

function toPublicFileUrl(req, filename) {
  return `/api/uploads/${filename}`;
}

function pickBody(body) {
  const { title, category, issuer, dateReceived, description, proofType, proofUrl } = body;
  return { title, category, issuer, dateReceived, description, proofType, proofUrl };
}

function validatePayload({ title, category, proofType, proofUrl, file }, isEdit) {
  if (!isEdit && (!title || !String(title).trim())) throw new ApiError(400, 'Title is required');
  if (category && !CATEGORIES.includes(category)) throw new ApiError(400, 'Invalid category');
  if (proofType && !['file', 'url'].includes(proofType)) throw new ApiError(400, 'Invalid proof type');
  if (proofType === 'url') {
    if (!proofUrl || !String(proofUrl).trim()) throw new ApiError(400, 'Proof link is required');
    try {
      const u = new URL(String(proofUrl).trim());
      if (!['http:', 'https:'].includes(u.protocol)) throw new ApiError(400, 'Proof link must be http or https');
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(400, 'Invalid proof link');
    }
  } else if (proofType === 'file' && !isEdit && !file) {
    throw new ApiError(400, 'Proof file is required (PDF/JPG/PNG/WebP, max 5MB)');
  }
}

// GET /api/achievements — sariling achievements ng naka-login
const list = asyncHandler(async (req, res) => {
  const items = await Achievement.find({ user: req.user._id }).sort({ dateReceived: -1, createdAt: -1 });
  res.json({ success: true, data: { achievements: items } });
});

// POST /api/achievements — multipart (file) o JSON (url)
const create = asyncHandler(async (req, res) => {
  const data = pickBody(req.body);
  validatePayload({ ...data, file: req.file }, false);

  const record = {
    user: req.user._id,
    title: String(data.title).trim(),
    category: data.category || 'certificate',
    issuer: (data.issuer || '').trim(),
    description: (data.description || '').trim(),
    proofType: data.proofType || 'file',
  };
  if (data.dateReceived) record.dateReceived = new Date(data.dateReceived);
  if (record.proofType === 'url') {
    record.proofUrl = String(data.proofUrl).trim();
  } else {
    record.fileUrl = toPublicFileUrl(req, req.file.filename);
    record.fileName = req.file.originalname;
    record.fileSize = req.file.size;
    record.fileType = req.file.mimetype;
  }

  const created = await Achievement.create(record);
  res.status(201).json({ success: true, data: { achievement: created } });
});

// PUT /api/achievements/:id
const update = asyncHandler(async (req, res) => {
  const item = await Achievement.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError(404, 'Achievement not found');

  const data = pickBody(req.body);
  const nextProofType = data.proofType || item.proofType;
  validatePayload({ ...data, proofType: nextProofType, file: req.file }, true);

  if (data.title !== undefined) item.title = String(data.title).trim();
  if (data.category) item.category = data.category;
  if (data.issuer !== undefined) item.issuer = String(data.issuer).trim();
  if (data.description !== undefined) item.description = String(data.description).trim();
  if (data.dateReceived) item.dateReceived = new Date(data.dateReceived);
  item.proofType = nextProofType;

  if (nextProofType === 'url') {
    if (data.proofUrl !== undefined) item.proofUrl = String(data.proofUrl).trim();
    if (item.fileUrl) {
      removeUpload(item.fileUrl);
      item.fileUrl = null;
      item.fileName = '';
      item.fileSize = 0;
      item.fileType = '';
    }
  } else if (req.file) {
    if (item.fileUrl) removeUpload(item.fileUrl);
    item.fileUrl = toPublicFileUrl(req, req.file.filename);
    item.fileName = req.file.originalname;
    item.fileSize = req.file.size;
    item.fileType = req.file.mimetype;
    item.proofUrl = '';
  }

  await item.save();
  res.json({ success: true, data: { achievement: item } });
});

// DELETE /api/achievements/:id
const remove = asyncHandler(async (req, res) => {
  const item = await Achievement.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new ApiError(404, 'Achievement not found');
  if (item.fileUrl) removeUpload(item.fileUrl);
  await item.deleteOne();
  res.json({ success: true, message: 'Achievement deleted' });
});

module.exports = { list, create, update, remove };
