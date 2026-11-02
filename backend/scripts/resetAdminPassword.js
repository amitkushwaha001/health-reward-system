const path = require('node:path');
const readline = require('node:readline/promises');
const { StringDecoder } = require('node:string_decoder');
const mongoose = require('mongoose');
const User = require('../models/User');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const TARGET_EMAIL = 'amitkushwaha200215@gmail.com';
const MIN_PASSWORD_LENGTH = 12;
const SAFE_FAILURES = new Set([
  'MONGODB_URI must be configured for the intended database',
  'Account confirmation did not match',
  'Password entries did not match',
  `The new password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
  'The new password must differ from the current password',
  'No existing account matches the configured admin email',
  'An interactive terminal is required to enter the password securely',
  'Password entry cancelled',
  'Password input closed',
  'Workflow password secrets are accepted only in GitHub Actions',
  'Workflow confirmation did not match the configured admin email',
  'GitHub Actions admin password secret is missing',
]);

const getWorkflowPassword = (environment = process.env) => {
  const password = environment.ADMIN_RESET_PASSWORD;
  const confirmation = environment.ADMIN_RESET_CONFIRM_EMAIL;

  if (environment.GITHUB_ACTIONS !== 'true') {
    if (password !== undefined || confirmation !== undefined) {
      throw new Error('Workflow password secrets are accepted only in GitHub Actions');
    }
    return undefined;
  }

  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('GitHub Actions admin password secret is missing');
  }
  if (typeof confirmation !== 'string' || confirmation.trim().toLowerCase() !== TARGET_EMAIL) {
    throw new Error('Workflow confirmation did not match the configured admin email');
  }

  return password;
};

const resetAdminAccount = async (newPassword, UserModel = User) => {
  if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`The new password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }

  const user = await UserModel.findOne({ email: TARGET_EMAIL }).select('+password');
  if (!user) {
    throw new Error('No existing account matches the configured admin email');
  }
  if (await user.matchPassword(newPassword)) {
    throw new Error('The new password must differ from the current password');
  }

  user.password = newPassword;
  user.role = 'admin';
  await user.save();
};

const askVisible = async (question) => {
  const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    return await prompt.question(question);
  } finally {
    prompt.close();
  }
};

const askHidden = (question) => new Promise((resolve, reject) => {
  const input = process.stdin;
  const decoder = new StringDecoder('utf8');
  let value = '';
  let settled = false;

  const finish = (error, result) => {
    if (settled) return;
    settled = true;
    input.removeListener('data', onData);
    input.removeListener('end', onEnd);
    input.setRawMode(false);
    input.pause();
    process.stdout.write('\n');
    if (error) reject(error);
    else resolve(result);
  };

  const onData = (chunk) => {
    for (const character of decoder.write(chunk)) {
      if (character === '\u0003' || character === '\u0004') {
        finish(new Error('Password entry cancelled'));
        return;
      }
      if (character === '\r' || character === '\n') {
        finish(null, value);
        return;
      }
      if (character === '\u007f' || character === '\b') {
        value = Array.from(value).slice(0, -1).join('');
      } else if (character.codePointAt(0) >= 0x20 && character.codePointAt(0) !== 0x7f) {
        value += character;
      }
    }
  };

  const onEnd = () => finish(new Error('Password input closed'));

  if (!input.isTTY || !process.stdout.isTTY || typeof input.setRawMode !== 'function') {
    reject(new Error('An interactive terminal is required to enter the password securely'));
    return;
  }

  process.stdout.write(question);
  input.setRawMode(true);
  input.resume();
  input.on('data', onData);
  input.once('end', onEnd);
});

const main = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured for the intended database');
  }

  let newPassword;
  let passwordConfirmation;
  try {
    newPassword = getWorkflowPassword();
    if (newPassword !== undefined) {
      passwordConfirmation = newPassword;
    } else {
      const confirmation = await askVisible(`Type ${TARGET_EMAIL} to confirm the account: `);
      if (confirmation.trim().toLowerCase() !== TARGET_EMAIL) {
        throw new Error('Account confirmation did not match');
      }

      newPassword = await askHidden('New password (input hidden): ');
      passwordConfirmation = await askHidden('Confirm new password (input hidden): ');
    }

    if (newPassword !== passwordConfirmation) {
      throw new Error('Password entries did not match');
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`The new password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }

    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    await resetAdminAccount(newPassword);
    process.stdout.write('Admin password reset completed for the existing account.\n');
  } finally {
    newPassword = null;
    passwordConfirmation = null;
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

if (require.main === module) {
  main().catch((error) => {
    const message = SAFE_FAILURES.has(error.message)
      ? error.message
      : 'Check database connectivity and the configured database. No credentials or database details were printed.';
    process.stderr.write(`Admin password reset did not complete: ${message}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  getWorkflowPassword,
  resetAdminAccount,
  TARGET_EMAIL,
};
