// src/utils/supabaseStorage.js
const supabase = require('../config/supabase');

const uploadFileToSupabase = async (file, bucketName = 'uploads') => {
  const fileName = `${Date.now()}-${file.originalname}`;
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};

module.exports = { uploadFileToSupabase };