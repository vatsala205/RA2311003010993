const { config } = require('../logging_middleware/config');
const { getAccessToken } = require('../logging_middleware/auth');
const { Log } = require('../logging_middleware/logger');

const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function normalizeNotification(notification) {
  const type = notification.Type;
  const timestamp = notification.Timestamp;
  const date = timestamp ? new Date(timestamp) : new Date(0);

  return {
    ...notification,
    Type: type || 'Unknown',
    Timestamp: date,
    priorityWeight: TYPE_WEIGHTS[type] || 0,
    sortTime: Number.isNaN(date.getTime()) ? 0 : date.getTime()
  };
}

function sortNotificationsByPriority(notifications) {
  return notifications.sort((left, right) => {
    if (right.priorityWeight !== left.priorityWeight) {
      return right.priorityWeight - left.priorityWeight;
    }

    return right.sortTime - left.sortTime;
  });
}

async function fetchNotifications() {
  await Log('backend', 'info', 'service', 'Starting notifications fetch');

  try {
    const token = await getAccessToken();
    const response = await fetch(`${config.BASE_URL}/notifications`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Notifications fetch failed: ${response.status}`);
    }

    const notifications = Array.isArray(data.notifications) ? data.notifications : [];
    await Log('backend', 'info', 'service', `Fetched ${notifications.length} notices`);

    return notifications;
  } catch (error) {
    await Log('backend', 'error', 'service', `Fetch notices failed ${error.message}`);
    throw error;
  }
}

async function getTopNotifications() {
  try {
    const notifications = await fetchNotifications();

    if (notifications.length === 0) {
      await Log('backend', 'warn', 'service', 'Notifications list is empty');
      return [];
    }

    const normalizedNotifications = [];

    for (const notification of notifications) {
      if (!notification.Type || !notification.Timestamp) {
        await Log('backend', 'warn', 'service', 'Notice missing type or timestamp');
      }

      normalizedNotifications.push(normalizeNotification(notification));
    }

    await Log('backend', 'info', 'service', 'Sorting notifications by priority');
    const topNotifications = sortNotificationsByPriority(normalizedNotifications).slice(0, 10);
    await Log('backend', 'info', 'service', `Top notices ready ${topNotifications.length}`);

    return topNotifications;
  } catch (error) {
    await Log('backend', 'fatal', 'service', `Stage6 failed ${error.message}`);
    throw error;
  }
}

if (require.main === module) {
  getTopNotifications()
    .then((notifications) => {
      console.log(JSON.stringify(notifications, null, 2));
    })
    .catch((error) => {
      console.error('Notification execution failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  getTopNotifications,
  sortNotificationsByPriority
};
