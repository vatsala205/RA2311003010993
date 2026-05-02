const fs = require('fs');
const path = require('path');

const ENV_PATH = path.resolve(__dirname, '..', '.env');

function loadEnvFile() {
  if (!fs.existsSync(ENV_PATH)) {
    return;
  }

  const fileContents = fs.readFileSync(ENV_PATH, 'utf8');
  const lines = fileContents.split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const config = {
  BASE_URL: process.env.BASE_URL || 'http://20.207.122.201/evaluation-service',
  registration: {
    name: process.env.NAME || '',
    email: process.env.EMAIL || '',
    rollNo: process.env.ROLL_NO || '',
    mobileNo: process.env.MOBILE_NO || '',
    githubUsername: process.env.GITHUB_USERNAME || '',
    accessCode: process.env.ACCESS_CODE || ''
  },
  clientID: process.env.CLIENT_ID || '',
  clientSecret: process.env.CLIENT_SECRET || ''
};

async function saveClientCredentials(clientID, clientSecret) {
  config.clientID = clientID;
  config.clientSecret = clientSecret;
  process.env.CLIENT_ID = clientID;
  process.env.CLIENT_SECRET = clientSecret;

  const currentContents = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  const lines = currentContents ? currentContents.split(/\r?\n/) : [];
  const keysToUpsert = {
    CLIENT_ID: clientID,
    CLIENT_SECRET: clientSecret
  };
  const seenKeys = new Set();
  const updatedLines = lines.map((line) => {
    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      return line;
    }

    const key = line.slice(0, separatorIndex).trim();

    if (!(key in keysToUpsert)) {
      return line;
    }

    seenKeys.add(key);
    return `${key}=${keysToUpsert[key]}`;
  });

  for (const [key, value] of Object.entries(keysToUpsert)) {
    if (!seenKeys.has(key)) {
      updatedLines.push(`${key}=${value}`);
    }
  }

  fs.writeFileSync(ENV_PATH, `${updatedLines.filter(Boolean).join('\n')}\n`, 'utf8');
}

module.exports = {
  config,
  saveClientCredentials
};
