// src/controllers/achievement.controller.js
const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadFileToSupabase } = require('../utils/supabaseStorage');

const CATEGORIES = ['certificate', 'award', 'competition', 'leadership', 'project', 'other'];

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

// GET /api/achievements — list user achievements
const list = asyncHandler(async (req, res) => {
  const { data: items, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', req.user.id)
    .order('date_received', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  const achievements = (items || []).map(row => ({
    id: row.id,
    user: row.user_id,
    title: row.title,
    category: row.category,
    issuer: row.issuer,
    dateReceived: row.date_received,
    description: row.description,
    proofType: row.proof_type,
    proofUrl: row.proof_url,
    fileUrl: row.file_url,
    fileName: row.file_name,
    fileSize: row.file_size,
    fileType: row.file_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  res.json({ success: true, data: { achievements } });
});

// POST /api/achievements — create achievement with Supabase cloud file upload
const create = asyncHandler(async (req, res) => {
  const data = pickBody(req.body);
  validatePayload({ ...data, file: req.file }, false);

  let fileUrl = '';
  let fileName = '';
  let fileSize = 0;
  let fileType = '';

  const proofType = data.proofType || 'file';

  if (proofType === 'file' && req.file) {
    fileUrl = await uploadFileToSupabase(req.file, 'uploads');
    fileName = req.file.originalname;
    fileSize = req.file.size;
    fileType = req.file.mimetype;
  }

  const insertPayload = {
    user_id: req.user.id,
    title: String(data.title).trim(),
    category: data.category || 'certificate',
    issuer: (data.issuer || '').trim(),
    description: (data.description || '').trim(),
    proof_type: proofType,
    proof_url: proofType === 'url' ? String(data.proofUrl).trim() : '',
    file_url: fileUrl,
    file_name: fileName,
    file_size: fileSize,
    file_type: fileType,
    date_received: data.dateReceived ? new Date(data.dateReceived).toISOString() : null,
  };

  const { data: createdRow, error } = await supabase
    .from('achievements')
    .insert([insertPayload])
    .select()
    .single();

  if (error) throw error;

  const achievement = {
    id: createdRow.id,
    user: createdRow.user_id,
    title: createdRow.title,
    category: createdRow.category,
    issuer: createdRow.issuer,
    dateReceived: createdRow.date_received,
    description: createdRow.description,
    proofType: createdRow.proof_type,
    proofUrl: createdRow.proof_url,
    fileUrl: createdRow.file_url,
    fileName: createdRow.file_name,
    fileSize: createdRow.file_size,
    fileType: createdRow.file_type,
    createdAt: createdRow.created_at,
    updatedAt: createdRow.updated_at,
  };

  res.status(201).json({ success: true, data: { achievement } });
});

// PUT /api/achievements/:id — update achievement
const update = asyncHandler(async (req, res) => {
  const { data: existingItem, error: fetchError } = await supabase
    .from('achievements')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (fetchError || !existingItem) {
    throw new ApiError(404, 'Achievement not found');
  }

  const data = pickBody(req.body);
  const nextProofType = data.proofType || existingItem.proof_type;
  validatePayload({ ...data, proofType: nextProofType, file: req.file }, true);

  const updatePayload = {};
  if (data.title !== undefined) updatePayload.title = String(data.title).trim();
  if (data.category) updatePayload.category = data.category;
  if (data.issuer !== undefined) updatePayload.issuer = String(data.issuer).trim();
  if (data.description !== undefined) updatePayload.description = String(data.description).trim();
  if (data.dateReceived) updatePayload.date_received = new Date(data.dateReceived).toISOString();
  updatePayload.proof_type = nextProofType;

  if (nextProofType === 'url') {
    if (data.proofUrl !== undefined) updatePayload.proof_url = String(data.proofUrl).trim();
    updatePayload.file_url = '';
    updatePayload.file_name = '';
    updatePayload.file_size = 0;
    updatePayload.file_type = '';
  } else if (req.file) {
    const fileUrl = await uploadFileToSupabase(req.file, 'uploads');
    updatePayload.file_url = fileUrl;
    updatePayload.file_name = req.file.originalname;
    updatePayload.file_size = req.file.size;
    updatePayload.file_type = req.file.mimetype;
    updatePayload.proof_url = '';
  }

  updatePayload.updated_at = new Date().toISOString();

  const { data: updatedRow, error: updateError } = await supabase
    .from('achievements')
    .update(updatePayload)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (updateError) throw updateError;

  const achievement = {
    id: updatedRow.id,
    user: updatedRow.user_id,
    title: updatedRow.title,
    category: updatedRow.category,
    issuer: updatedRow.issuer,
    dateReceived: updatedRow.date_received,
    description: updatedRow.description,
    proofType: updatedRow.proof_type,
    proofUrl: updatedRow.proof_url,
    fileUrl: updatedRow.file_url,
    fileName: updatedRow.file_name,
    fileSize: updatedRow.file_size,
    fileType: updatedRow.file_type,
    createdAt: updatedRow.created_at,
    updatedAt: updatedRow.updated_at,
  };

  res.json({ success: true, data: { achievement } });
});

// DELETE /api/achievements/:id — delete achievement
const remove = asyncHandler(async (req, res) => {
  const { data: existingItem, error: fetchError } = await supabase
    .from('achievements')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (fetchError || !existingItem) {
    throw new ApiError(404, 'Achievement not found');
  }

  const { error: deleteError } = await supabase
    .from('achievements')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (deleteError) throw deleteError;

  res.json({ success: true, message: 'Achievement deleted' });
});

module.exports = { list, create, update, remove, CATEGORIES };