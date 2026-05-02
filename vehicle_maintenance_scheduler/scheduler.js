function solveKnapsack(tasks, capacity) {
  const normalizedTasks = Array.isArray(tasks) ? tasks : [];
  const normalizedCapacity = Number.isInteger(capacity) && capacity > 0 ? capacity : 0;

  if (normalizedTasks.length === 0 || normalizedCapacity === 0) {
    return {
      selectedTasks: [],
      totalImpact: 0
    };
  }

  const taskCount = normalizedTasks.length;
  const dp = Array.from({ length: taskCount + 1 }, () => Array(normalizedCapacity + 1).fill(0));

  for (let itemIndex = 1; itemIndex <= taskCount; itemIndex += 1) {
    const task = normalizedTasks[itemIndex - 1];
    const duration = Number(task.Duration) || 0;
    const impact = Number(task.Impact) || 0;

    for (let currentCapacity = 0; currentCapacity <= normalizedCapacity; currentCapacity += 1) {
      dp[itemIndex][currentCapacity] = dp[itemIndex - 1][currentCapacity];

      if (duration <= currentCapacity) {
        const candidateImpact = dp[itemIndex - 1][currentCapacity - duration] + impact;

        if (candidateImpact > dp[itemIndex][currentCapacity]) {
          dp[itemIndex][currentCapacity] = candidateImpact;
        }
      }
    }
  }

  const selectedTasks = [];
  let remainingCapacity = normalizedCapacity;

  for (let itemIndex = taskCount; itemIndex > 0; itemIndex -= 1) {
    if (dp[itemIndex][remainingCapacity] === dp[itemIndex - 1][remainingCapacity]) {
      continue;
    }

    const task = normalizedTasks[itemIndex - 1];
    selectedTasks.push(task);
    remainingCapacity -= Number(task.Duration) || 0;
  }

  selectedTasks.reverse();

  return {
    selectedTasks,
    totalImpact: dp[taskCount][normalizedCapacity]
  };
}

module.exports = {
  solveKnapsack
};
