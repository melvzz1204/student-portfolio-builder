// src/models/Achievement.js
const supabase = require('../config/supabase');

class Achievement {
  /**
   * Find all achievements for a specific user
   * @param {string} userId - User's UUID
   */
  static async findByUserId(userId) {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Find a single achievement by ID
   * @param {string} id - Achievement UUID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found error code
    return data;
  }

  /**
   * Create a new achievement record
   * @param {Object} achievementData
   */
  static async create(achievementData) {
    const {
      userId,
      title,
      category,
      issuer,
      dateIssued,
      description,
      proofFileUrl,
    } = achievementData;

    const { data, error } = await supabase
      .from('achievements')
      .insert([
        {
          user_id: userId,
          title,
          category,
          issuer,
          date_issued: dateIssued,
          description,
          proof_file_url: proofFileUrl,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing achievement
   * @param {string} id - Achievement UUID
   * @param {string} userId - Owner's UUID (for ownership check)
   * @param {Object} updates
   */
  static async update(id, userId, updates) {
    const { title, category, issuer, dateIssued, description, proofFileUrl } = updates;

    const payload = {};
    if (title !== undefined) payload.title = title;
    if (category !== undefined) payload.category = category;
    if (issuer !== undefined) payload.issuer = issuer;
    if (dateIssued !== undefined) payload.date_issued = dateIssued;
    if (description !== undefined) payload.description = description;
    if (proofFileUrl !== undefined) payload.proof_file_url = proofFileUrl;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('achievements')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete an achievement
   * @param {string} id - Achievement UUID
   * @param {string} userId - Owner's UUID
   */
  static async delete(id, userId) {
    const { data, error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = Achievement;