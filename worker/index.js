require("dotenv").config();

const { PrismaClient } = require("../server/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const { createCrawler } = require("./services/crawler");
const { extractLinks } = require("./services/linkExtractor");

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const interval =
  Number(process.env.WORKER_INTERVAL_MS) || 60000;

let running = false;

async function recordError(website, brokenUrl, sourceUrl, status) {
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

  // Create a scan record when the website scan starts
  const scan = await prisma.scan.create({
    data: {
      websiteId: website.id,
      status: "running",
    },
  });

  console.log(`Scan ${scan.id} started for ${website.url}`);

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

      if (result.is404) {
        await recordError(
          website,
          result.brokenUrl,
          result.sourceUrl,
          "404"
        );

        continue;
      }

      if (result.html) {
        const links = extractLinks(
          result.html,
          result.brokenUrl
        );

        for (const link of links) {
          try {
            const linkResult = await crawler.checkUrlFor404(
              link,
              result.brokenUrl
            );

            if (!linkResult) {
              continue;
            }

            console.log(
              `${linkResult.brokenUrl} -> ${linkResult.statusCode}`
            );

            if (linkResult.is404) {
              await recordError(
                website,
                linkResult.brokenUrl,
                result.brokenUrl,
                "404"
              );
            } else {
              crawler.enqueueUrl(link);

              if (linkResult.html) {
                const nestedLinks = extractLinks(
                  linkResult.html,
                  linkResult.brokenUrl
                );

                for (const nestedLink of nestedLinks) {
                  crawler.enqueueUrl(nestedLink);
                }
              }
            }
          } catch (error) {
            console.error(
              `Failed to check link ${link}:`,
              error.message
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

  // Mark the scan as completed
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
