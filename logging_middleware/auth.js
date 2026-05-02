const { config, saveClientCredentials } = require('./config');

let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function postJson(path, payload) {
  const response = await fetch(`${config.BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function registerClient() {
  if (config.clientID && config.clientSecret) {
    return {
      clientID: config.clientID,
      clientSecret: config.clientSecret
    };
  }

  const registrationResponse = await postJson('/register', config.registration);
  await saveClientCredentials(registrationResponse.clientID, registrationResponse.clientSecret);

  return {
    clientID: registrationResponse.clientID,
    clientSecret: registrationResponse.clientSecret
  };
}

async function getAccessToken() {
  const hasValidCachedToken = cachedToken && cachedTokenExpiresAt > Date.now() + 60 * 1000;

  if (hasValidCachedToken) {
    return cachedToken;
  }

  const { clientID, clientSecret } = await registerClient();
  const authPayload = {
    name: config.registration.name,
    email: config.registration.email,
    rollNo: config.registration.rollNo,
    accessCode: config.registration.accessCode,
    clientID,
    clientSecret
  };
  const authResponse = await postJson('/auth', authPayload);

  cachedToken = authResponse.access_token;
  cachedTokenExpiresAt = Number(authResponse.expires_in) * 1000;

  return cachedToken;
}

module.exports = {
  getAccessToken,
  registerClient
};
