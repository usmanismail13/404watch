require("dotenv").config();

const axios = require("axios");
const { PrismaClient } = require("../server/generated/prisma/client.ts");
const { PrismaPg } = require("@prisma/adapter-pg");

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const interval =
  Number(process.env.WORKER_INTERVAL_MS) || 60000;

let running = false;

async function recordError(website, status) {
  const existingError = await prisma.error404.findFirst({
    where: {
      websiteId: website.id,
      url: website.url,
      status,
    },
    orderBy: {
      detectedAt: "desc",
    },
  });

  if (existingError) {
    console.log(
      `Existing ${status} error found for ${website.url}. Skipping duplicate.`
    );
    return;
  }

  await prisma.error404.create({
    data: {
      websiteId: website.id,
      url: website.url,
      sourceUrl: website.url,
      status,
    },
  });

  console.log(`${status} recorded: ${website.url}`);
}

async function checkWebsite(website) {
  console.log(`Checking ${website.url}`);

  try {
    const response = await axios.get(website.url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true,
    });

    console.log(`${website.url} -> ${response.status}`);

    if (response.status === 404) {
      await recordError(website, "404");
    }
  } catch (error) {
    console.error(
      `Failed to check ${website.url}:`,
      error.message
    );

    await recordError(website, "ERROR");
  }
}

async function runMonitoringCycle() {
  if (running) {
    console.log("Previous cycle is still running. Skipping.");
    return;
  }

  running = true;

  try {
    console.log("\n=== Monitoring cycle started ===");

    const websites = await prisma.website.findMany({
      where: {
        monitoringEnabled: true,
      },
    });

    console.log(`Found ${websites.length} websites`);

    for (const website of websites) {
      await checkWebsite(website);
    }

    console.log("=== Monitoring cycle completed ===\n");
  } catch (error) {
    console.error("Monitoring cycle failed:", error);
  } finally {
    running = false;
  }
}

async function startWorker() {
  console.log("404Watch Monitoring Worker started");
  console.log(`Interval: ${interval / 1000} seconds`);

  await runMonitoringCycle();

  setInterval(runMonitoringCycle, interval);
}

async function shutdown() {
  console.log("Stopping worker...");

  await prisma["$disconnect"]();

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startWorker().catch(async (error) => {
  console.error("Worker startup failed:", error);

  await prisma["$disconnect"]();

  process.exit(1);
});
