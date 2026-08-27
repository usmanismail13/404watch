require("dotenv").config({
  path: "./.env",
});



const { PrismaClient } = require("../server/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const { createCrawler } = require("./services/crawler");
const { extractLinks } = require("./services/linkExtractor");

console.log(
  "DATABASE_URL loaded:",
  !!process.env.DATABASE_URL
);

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const interval =
  Number(process.env.WORKER_INTERVAL_MS) || 60000;

const maxSimultaneousScans =
  Number(process.env.MAX_SIMULTANEOUS_SCANS) || 2;

const maxScanRetries =
  Number(process.env.MAX_SCAN_RETRIES) || 2;

const scanRetryDelay =
  Number(process.env.SCAN_RETRY_DELAY_MS) || 5000;

let running = false;

async function recordError(
  website,
  brokenUrl,
  sourceUrl,
  status
) {
  const existingError = await prisma.error404.findFirst({
    where: {
      websiteId: website.id,
      url: brokenUrl,
    },
    orderBy: {
      detectedAt: "desc",
    },
  });

  if (existingError) {
    await prisma.error404.update({
      where: {
        id: existingError.id,
      },
      data: {
        sourceUrl,
        status,
        detectedAt: new Date(),
      },
    });

    console.log(
      `Existing ${status} error updated: ${brokenUrl}`
    );

    return;
  }

  await prisma.error404.create({
    data: {
      websiteId: website.id,
      url: brokenUrl,
      sourceUrl,
      status,
    },
  });

  console.log(
    `${status} recorded: ${brokenUrl} (source: ${sourceUrl})`
  );
}

async function checkWebsite(website) {
  console.log(`Checking ${website.url}`);

  const scan = await prisma.scan.create({
    data: {
      websiteId: website.id,
      status: "running",
    },
  });

  console.log(
    `Scan ${scan.id} started for ${website.url}`
  );

  try {
    const crawler = createCrawler(
      website.url,
      website.id,
      prisma
    );

    while (!crawler.isQueueEmpty()) {
      const currentUrl = crawler.dequeueUrl();

      if (!currentUrl) {
        continue;
      }

      try {
        const result = await crawler.checkUrlFor404(
          currentUrl,
          website.url
        );

        if (!result) {
          continue;
        }

        console.log(
          `${result.brokenUrl} -> ${result.statusCode}`
        );

        /*
         * 404 response
         */
        if (result.is404) {
          await recordError(
            website,
            result.brokenUrl,
            result.sourceUrl,
            "404"
          );

          continue;
        }

        /*
         * Successful HTML page
         *
         * Extract all links and add them to the
         * crawler queue. The main crawler loop will
         * process those URLs next.
         */
        if (result.html) {
          const links = extractLinks(
            result.html,
            result.brokenUrl
          );

          console.log(
            `Found ${links.length} links on ${result.brokenUrl}`
          );

          for (const link of links) {
            const added = crawler.enqueueUrl(link);

            if (added) {
              console.log(
                `Queued: ${link}`
              );
            }
          }
        }
      } catch (error) {
        console.error(
          `Failed to check ${currentUrl}:`,
          error.message
        );
      }
    }

    await prisma.scan.update({
      where: {
        id: scan.id,
      },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    console.log(
      `Scan ${scan.id} completed for ${website.url}`
    );

    return true;
  } catch (error) {
    console.error(
      `Scan ${scan.id} failed for ${website.url}:`,
      error.message
    );

    try {
      await prisma.scan.update({
        where: {
          id: scan.id,
        },
        data: {
          status: "failed",
          completedAt: new Date(),
        },
      });

      console.log(
        `Scan ${scan.id} marked as failed`
      );
    } catch (updateError) {
      console.error(
        `Failed to update scan ${scan.id}:`,
        updateError.message
      );
    }

    return false;
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function checkWebsiteWithRetry(website) {
  let attempt = 0;

  while (attempt <= maxScanRetries) {
    attempt++;

    console.log(
      `Scan attempt ${attempt}/${maxScanRetries + 1} for ${website.url}`
    );

    const success = await checkWebsite(website);

    if (success) {
      return;
    }

    if (attempt > maxScanRetries) {
      console.error(
        `Scan permanently failed after ${attempt} attempts: ${website.url}`
      );

      return;
    }

    console.log(
      `Retrying scan for ${website.url} in ${
        scanRetryDelay / 1000
      } seconds...`
    );

    await wait(scanRetryDelay);
  }
}

async function runMonitoringCycle() {
  if (running) {
    console.log(
      "Previous cycle is still running. Skipping."
    );

    return;
  }

  running = true;

  try {
    console.log(
      "\n=== Monitoring cycle started ==="
    );

    const websites = await prisma.website.findMany({
      where: {
        monitoringEnabled: true,
      },
    });

    console.log(
      `Found ${websites.length} websites`
    );

    /*
     * Limit the number of websites being scanned
     * simultaneously.
     */
    for (
      let i = 0;
      i < websites.length;
      i += maxSimultaneousScans
    ) {
      const batch = websites.slice(
        i,
        i + maxSimultaneousScans
      );

      console.log(
        `Starting scan batch: ${batch.length} websites`
      );

      await Promise.all(
        batch.map((website) =>
          checkWebsiteWithRetry(website)
        )
      );

      console.log(
        `Scan batch completed: ${batch.length} websites`
      );
    }

    console.log(
      "=== Monitoring cycle completed ===\n"
    );
  } catch (error) {
    console.error(
      "Monitoring cycle failed:",
      error
    );
  } finally {
    running = false;
  }
}

async function startWorker() {
  console.log(
    "404Watch Monitoring Worker started"
  );

  console.log(
    `Interval: ${interval / 1000} seconds`
  );

  console.log(
    `Maximum simultaneous scans: ${maxSimultaneousScans}`
  );

  console.log(
    `Maximum scan retries: ${maxScanRetries}`
  );

  console.log(
    `Scan retry delay: ${scanRetryDelay / 1000} seconds`
  );

  await runMonitoringCycle();

  setInterval(
    runMonitoringCycle,
    interval
  );
}

async function shutdown() {
  console.log("Stopping worker...");

  await prisma["$disconnect"]();

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startWorker().catch(async (error) => {
  console.error(
    "Worker startup failed:",
    error
  );

  await prisma["$disconnect"]();

  process.exit(1);
});
