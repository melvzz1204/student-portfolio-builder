// src/server.js
require('dotenv').config();

const app = require('./app');
const env = require('./config/env');

const start = async () => {
  try {
    app.listen(env.port, () => {
      console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();