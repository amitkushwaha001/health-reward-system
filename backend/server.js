require('dotenv').config();
require('express-async-errors');
const connectDB = require('./config/database');
const validateEnv = require('./config/validateEnv');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  validateEnv();
  await connectDB();
  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Unable to start server:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { startServer };
