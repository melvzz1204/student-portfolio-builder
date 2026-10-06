const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const start = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });
};

start();
