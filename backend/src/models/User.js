const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Find a user by email (optionally including password field if needed for comparison)
   */
  static async findOneByEmail(email, includePassword = false) {
    let query = supabase.from('users').select('*').eq('email', email.toLowerCase());
    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return new User(data, includePassword);
  }

  /**
   * Find a user by ID
   */
  static async findById(id, includePassword = false) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return new User(data, includePassword);
  }

  /**
   * Find a user by Google ID
   */
  static async findByGoogleId(googleId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return new User(data);
  }

  /**
   * Find a user by Slug
   */
  static async findBySlug(slug) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return new User(data);
  }

  /**
   * Create a new user record
   */
  static async create(userData) {
    let hashedPassword = null;
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(userData.password, salt);
    }

    const dbPayload = {
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      google_id: userData.googleId || null,
      avatar: userData.avatar || '',
      student_id: userData.studentId ? userData.studentId.toUpperCase() : null,
      course: userData.course || '',
      year_level: userData.yearLevel || '',
      section: userData.section || '',
      slug: userData.slug || null,
      is_public: userData.isPublic !== undefined ? userData.isPublic : true,
      headline: userData.headline || '',
      bio: userData.bio || '',
      phone: userData.phone || '',
      skills: userData.skills || [],
      education: userData.education || [],
    };

    const { data, error } = await supabase
      .from('users')
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw error;
    return new User(data);
  }

  constructor(row, includePassword = false) {
    this.id = row.id;
    this.name = row.name;
    this.email = row.email;
    if (includePassword) {
      this.password = row.password;
    }
    this.googleId = row.google_id;
    this.avatar = row.avatar;
    this.studentId = row.student_id;
    this.course = row.course;
    this.yearLevel = row.year_level;
    this.section = row.section;
    this.slug = row.slug;
    this.isPublic = row.is_public;
    this.headline = row.headline;
    this.bio = row.bio;
    this.phone = row.phone;
    this.skills = row.skills;
    this.education = row.education;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  /**
   * Compare candidate password with hashed password
   */
  async comparePassword(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Save / Update user fields
   */
  async save(updates = {}) {
    // Apply updates to current instance if passed
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        this[key] = updates[key];
      }
    });

    const dbPayload = {
      name: this.name,
      email: this.email,
      google_id: this.googleId,
      avatar: this.avatar,
      student_id: this.studentId ? this.studentId.toUpperCase() : null,
      course: this.course,
      year_level: this.yearLevel,
      section: this.section,
      slug: this.slug,
      is_public: this.isPublic,
      headline: this.headline,
      bio: this.bio,
      phone: this.phone,
      skills: this.skills,
      education: this.education,
      updated_at: new Date().toISOString(),
    };

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      dbPayload.password = await bcrypt.hash(updates.password, salt);
    }

    const { data, error } = await supabase
      .from('users')
      .update(dbPayload)
      .eq('id', this.id)
      .select()
      .single();

    if (error) throw error;
    
    // Refresh properties
    Object.assign(this, new User(data));
    return this;
  }

  /**
   * Clean object when sending to responses (equivalent to Mongoose toJSON)
   */
  toJSON() {
    const obj = { ...this };
    delete obj.password;
    return obj;
  }
}

module.exports = User;