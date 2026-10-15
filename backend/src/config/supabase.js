// src/config/supabase.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// Match the exact variable name used in your .env file
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL in your .env file.');
}

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_SECRET_KEY in your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;