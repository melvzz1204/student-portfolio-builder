const fs = require('fs');
const path = require('path');
const multer = require('multer');

const MAX_FILE_MB = 5;
const ACCEPTED_MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const owner = req.user?._id?.toString() || 'anon';
    cb(null, `${owner}-${Date.now()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (ACCEPTED_MIMES.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only PDF, JPG, PNG, or WebP files are allowed'));
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024 },
  fileFilter,
});

function removeUpload(fileUrl) {
  if (!fileUrl) return;
  try {
    const filename = path.basename(fileUrl);
    const full = path.join(uploadDir, filename);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch {
    // best effort lang — huwag ibagsak ang request
  }
}

module.exports = { upload, uploadDir, removeUpload, MAX_FILE_MB, ACCEPTED_MIMES };
