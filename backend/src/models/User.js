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
      // Required only if user didn't register via Google OAuth
      required: [
        function () {
          return !this.googleId;
        },
        'Password is required',
      ],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    // Google OAuth fields
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: '',
    },
    // MarSU Student ID (hal. 2023-00123) — ito ang batayan kung lehitimong
    // estudyante ng MarSU ang nagre-register, hindi ang email domain.
    // Kahit anong valid email address ay pwedeng gamitin sa login.
    // Required lamang kapag hindi Google OAuth ang gamit.
    studentId: {
      type: String,
      required: [
        function () {
          return !this.googleId;
        },
        'Student ID is required',
      ],
      unique: true,
      sparse: true, // Allows null/missing values for new Google users without index collision
      uppercase: true,
      trim: true,
      match: [/^\d{4}-\d{5}$/, 'Student ID must follow the YYYY-NNNNN format (e.g. 2023-00123)'],
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
  // Only hash password if password field was provided and modified
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // Prevent comparison for passwordless Google users
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);