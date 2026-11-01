const validateEnv = (env = process.env) => {
  const missing = [];

  if (!env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) missing.push('JWT_SECRET (at least 32 characters)');

  const ratio = Number(env.STEPS_TO_POINTS_RATIO || 100);
  if (!Number.isSafeInteger(ratio) || ratio < 1) {
    missing.push('STEPS_TO_POINTS_RATIO (positive integer)');
  }

  if (env.NODE_ENV === 'production' && !env.CORS_ORIGINS) {
    missing.push('CORS_ORIGINS');
  }

  if (missing.length) {
    throw new Error(`Invalid server configuration: ${missing.join(', ')}`);
  }
};

module.exports = validateEnv;
