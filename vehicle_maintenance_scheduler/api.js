const { config } = require('../logging_middleware/config');
const { getAccessToken } = require('../logging_middleware/auth');
const { Log } = require('../logging_middleware/logger');

async function fetchProtectedResource(path, resourceKey) {
  await Log('backend', 'info', 'service', `Starting ${resourceKey} fetch from ${path}`);

  try {
    const token = await getAccessToken();
    const response = await fetch(`${config.BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Fetch failed with ${response.status}: ${JSON.stringify(data)}`);
    }

    const items = Array.isArray(data[resourceKey]) ? data[resourceKey] : [];
    await Log('backend', 'info', 'service', `Fetched ${items.length} ${resourceKey}`);

    return items;
  } catch (error) {
    await Log('backend', 'error', 'service', `Failed to fetch ${resourceKey}: ${error.message}`);
    throw error;
  }
}

async function fetchDepots() {
  return fetchProtectedResource('/depots', 'depots');
}

async function fetchVehicles() {
  return fetchProtectedResource('/vehicles', 'vehicles');
}

module.exports = {
  fetchDepots,
  fetchVehicles
};
