const { Log } = require('../logging_middleware/logger');
const { fetchDepots, fetchVehicles } = require('./api');
const { solveKnapsack } = require('./scheduler');

function calculateTotalDuration(selectedTasks) {
  return selectedTasks.reduce((total, task) => total + (Number(task.Duration) || 0), 0);
}

async function runScheduler() {
  await Log('backend', 'info', 'controller', 'Starting vehicle maintenance scheduler run');

  try {
    const [depots, vehicles] = await Promise.all([fetchDepots(), fetchVehicles()]);

    if (depots.length === 0) {
      await Log('backend', 'warn', 'controller', 'No depots received from API');
      console.log(JSON.stringify([], null, 2));
      return [];
    }

    if (vehicles.length === 0) {
      await Log('backend', 'warn', 'controller', 'No vehicles received from API');
    }

    const results = [];

    for (const depot of depots) {
      const depotId = depot.ID ?? depot.depotId ?? null;
      const capacity = Number(depot.MechanicHours) || 0;

      await Log('backend', 'info', 'controller', `Starting DP for depot ${depotId} with capacity ${capacity}`);

      const { selectedTasks, totalImpact } = solveKnapsack(vehicles, capacity);
      const totalDuration = calculateTotalDuration(selectedTasks);
      const result = {
        depotId,
        selectedTasks,
        totalImpact,
        totalDuration
      };

      results.push(result);

      if (selectedTasks.length === 0) {
        await Log('backend', 'warn', 'controller', `No tasks selected for depot ${depotId}`);
      }

      await Log('backend', 'info', 'controller', `Depot ${depotId} impact ${totalImpact} dur ${totalDuration}`);
      await Log('backend', 'debug', 'controller', `Result ready for depot ${depotId}`);
    }

    await Log('backend', 'info', 'controller', 'Completed vehicle maintenance scheduler run');
    console.log(JSON.stringify(results, null, 2));

    return results;
  } catch (error) {
    await Log('backend', 'fatal', 'controller', `Scheduler run failed: ${error.message}`);
    throw error;
  }
}

if (require.main === module) {
  runScheduler().catch((error) => {
    console.error('Scheduler execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runScheduler
};
