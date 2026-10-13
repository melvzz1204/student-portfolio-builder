const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    // MarSU Student ID (hal. 2023-00123) — ito ang batayan kung lehitimong
    // estudyante ng MarSU ang nagre-register, hindi ang email domain.
    // Kahit anong valid email address ay pwedeng gamitin sa login.
    // Opsyonal na ngayon: ang mga alumni (role: 'alumni') ay walang Student ID.
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: (value) => !value || /^\d{4}-\d{5}$/.test(value),
        message: 'Student ID must follow the YYYY-NNNNN format (e.g. 2023-00123)',
      },
    },
    course: {
      type: String,
      trim: true,
      default: '',
    },
    yearLevel: {
      type: String,
      trim: true,
      default: '',
    },
    section: {
      type: String,
      trim: true,
      default: '',
    },
    // 'student' para sa mga kasalukuyang nag-aaral, 'alumni' para sa mga graduate.
    role: {
      type: String,
      enum: ['student', 'alumni'],
      default: 'student',
    },
    // Public portfolio slug (hal. juan-dela-cruz-a1b2c) — sparse para hindi
    // mag-conflict ang mga lumang user na wala pang slug.
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    // --- Resume / portfolio profile (editable ng estudyante) ---
    headline: {
      type: String,
      trim: true,
      default: '',
      maxlength: [120, 'Headline cannot exceed 120 characters'],
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [30, 'Phone cannot exceed 30 characters'],
    },
    skills: {
      type: [String],
      default: [],
    },
    education: {
      type: [
        {
          school: { type: String, trim: true, default: '' },
          degree: { type: String, trim: true, default: '' },
          startYear: { type: String, trim: true, default: '' },
          endYear: { type: String, trim: true, default: '' },
          details: { type: String, trim: true, default: '' },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
