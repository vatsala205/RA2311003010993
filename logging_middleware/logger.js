const { config } = require('./config');
const { getAccessToken } = require('./auth');

const VALID_STACKS = new Set(['backend', 'frontend']);
const VALID_LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const VALID_PACKAGES = new Set([
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'handler',
  'repository',
  'route',
  'service',
  'auth',
  'config',
  'middleware',
  'utils'
]);

function fallbackLog(stack, level, packageName, message, error) {
  console.error('[Log fallback]', {
    stack,
    level,
    package: packageName,
    message,
    error: error instanceof Error ? error.message : error
  });
}

function validateLogInput(stack, level, packageName, message) {
  if (!VALID_STACKS.has(stack)) {
    throw new Error(`Invalid stack: ${stack}`);
  }

  if (!VALID_LEVELS.has(level)) {
    throw new Error(`Invalid level: ${level}`);
  }

  if (!VALID_PACKAGES.has(packageName)) {
    throw new Error(`Invalid package: ${packageName}`);
  }

  if (typeof message !== 'string' || message.trim() === '') {
    throw new Error('Log message must be a non-empty string');
  }
}

async function Log(stack, level, packageName, message) {
  try {
    validateLogInput(stack, level, packageName, message);

    const token = await getAccessToken();
    const response = await fetch(`${config.BASE_URL}/logs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stack,
        level,
        package: packageName,
        message
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Logging API failed with ${response.status}: ${errorBody}`);
    }
  } catch (error) {
    fallbackLog(stack, level, packageName, message, error);
  }
}

module.exports = {
  Log
};
