const mongoose = require('mongoose');

const CATEGORIES = ['certificate', 'training', 'award', 'seminar', 'other'];

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'certificate',
    },
    issuer: {
      type: String,
      trim: true,
      default: '',
      maxlength: [120, 'Issuer cannot exceed 120 characters'],
    },
    dateReceived: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    proofType: {
      type: String,
      enum: ['file', 'url'],
      default: 'file',
    },
    // Kapag proofType === 'file'
    fileUrl: { type: String, default: null }, // hal. /api/uploads/<filename>
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    fileType: { type: String, default: '' },
    // Kapag proofType === 'url'
    proofUrl: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

achievementSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Achievement', achievementSchema);
module.exports.CATEGORIES = CATEGORIES;
