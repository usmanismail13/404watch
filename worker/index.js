require("dotenv").config();

const workerConfig = {
  name: "404Watch Monitoring Worker",
  environment: process.env.NODE_ENV || "development",
  interval: Number(process.env.WORKER_INTERVAL_MS) || 60 * 1000
};

const workerState = {
  status: "starting",
  lastCycleStartedAt: null,
  lastCycleCompletedAt: null,
  lastError: null
};

let monitoringInterval = null;
let isShuttingDown = false;

function runWebsiteScan() {
  console.log("Website scan started");

  // The actual website crawler will be implemented
  // in the following Phase 7 steps.
}

async function runMonitoringCycle() {
  if (isShuttingDown) {
    return;
  }

  workerState.status = "running";
  workerState.lastCycleStartedAt = new Date().toISOString();
  workerState.lastError = null;

  console.log("Monitoring cycle started");
  console.log(`Cycle started at: ${workerState.lastCycleStartedAt}`);

  try {
    await runWebsiteScan();

    workerState.lastCycleCompletedAt = new Date().toISOString();
    workerState.status = "waiting";

    console.log(
      `Monitoring cycle completed at: ${workerState.lastCycleCompletedAt}`
    );
  } catch (error) {
    workerState.status = "error";
    workerState.lastError = error.message;

    console.error("Monitoring cycle failed");
    console.error(error);
  }
}

function startWorker() {
  console.log(`${workerConfig.name} started`);
  console.log(`Environment: ${workerConfig.environment}`);
  console.log(
    `Monitoring interval: ${workerConfig.interval / 1000} seconds`
  );

  runMonitoringCycle();

  monitoringInterval = setInterval(() => {
    runMonitoringCycle();
  }, workerConfig.interval);
}

function stopWorker() {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log("404Watch Monitoring Worker stopping...");

  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }

  workerState.status = "stopped";

  console.log(`Worker status: ${workerState.status}`);
  console.log("404Watch Monitoring Worker stopped");

  process.exit(0);
}

process.on("SIGINT", stopWorker);
process.on("SIGTERM", stopWorker);

startWorker();
