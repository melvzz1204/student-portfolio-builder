// src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { buildSlug } = require('../utils/slug');
const supabase = require('./supabase');

console.log('Google Client ID Loaded:', process.env.GOOGLE_CLIENT_ID ? 'YES' : 'NO');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      scope: ['profile', 'email'], // <--- THIS LINE FIXES THE MISSING SCOPE ERROR
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error('No email found from Google profile'), null);
        }

        let user = await User.findOneByEmail(email);

        if (user) {
          const updates = {};
          if (profile.id && user.googleId !== profile.id) {
            updates.googleId = profile.id;
          }
          if (profile.photos?.[0]?.value && !user.avatar) {
            updates.avatar = profile.photos[0].value;
          }
          if (Object.keys(updates).length > 0) {
            await user.save(updates);
          }
          return done(null, user);
        }

        let slug = buildSlug(profile.displayName || 'user');
        while (true) {
          const { data: slugCheck } = await supabase.from('users').select('id').eq('slug', slug).single();
          if (!slugCheck) break;
          slug = buildSlug(profile.displayName || 'user') + '-' + Math.random().toString(36).substring(2, 6);
        }

        user = await User.create({
          name: profile.displayName || 'Google User',
          email: email,
          password: Math.random().toString(36).slice(-12),
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value || '',
          slug,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});