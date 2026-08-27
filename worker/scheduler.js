const cron = require("node-cron");

cron.schedule("0 2 * * *", () => {
  console.log("⏰ Scheduled scan job triggered.");
});

console.log("🟢 Scheduler is running.");
