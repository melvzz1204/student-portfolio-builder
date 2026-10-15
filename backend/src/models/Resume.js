// src/models/Resume.js
const supabase = require('../config/supabase');

class Resume {
  /**
   * Find a resume by user UUID
   */
  static async findOneByUser(userId) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*, user:users(id, name, slug, email)')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return new Resume(data);
  }

  /**
   * Find a resume by Resume ID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*, user:users(id, name, slug, email)')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return new Resume(data);
  }

  /**
   * Create a new resume record
   */
  static async create(resumeData) {
    const dbPayload = {
      user_id: resumeData.userId,
      title: resumeData.title || 'My Resume',
      personal_details: resumeData.personalDetails || {},
      profile: resumeData.profile || '',
      employment_history: resumeData.employmentHistory || [],
      education: resumeData.education || [],
      skills: resumeData.skills || [],
      references: resumeData.references || [],
    };

    const { data, error } = await supabase
      .from('resumes')
      .insert([dbPayload])
      .select('*, user:users(id, name, slug, email)')
      .single();

    if (error) throw error;
    return new Resume(data);
  }

  constructor(row) {
    this.id = row.id;
    this.user = row.user_id;
    this.userData = row.user || null; // Populated user info if requested
    this.title = row.title;
    this.personalDetails = row.personal_details;
    this.profile = row.profile;
    this.employmentHistory = row.employment_history;
    this.education = row.education;
    this.skills = row.skills;
    this.references = row.references;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  /**
   * Save or Update resume fields
   */
  async save(updates = {}) {
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        this[key] = updates[key];
      }
    });

    const dbPayload = {
      title: this.title,
      personal_details: this.personalDetails,
      profile: this.profile,
      employment_history: this.employmentHistory,
      education: this.education,
      skills: this.skills,
      references: this.references,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('resumes')
      .update(dbPayload)
      .eq('id', this.id)
      .select('*, user:users(id, name, slug, email)')
      .single();

    if (error) throw error;

    Object.assign(this, new Resume(data));
    return this;
  }

  /**
   * Format output response object
   */
  toJSON() {
    return { ...this };
  }
}

module.exports = Resume;