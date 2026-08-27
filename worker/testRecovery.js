require("dotenv/config");

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../server/generated/prisma/client");
const { createCrawler } = require("./services/crawler");

async function testRecovery() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  const testUrl = "https://example.com/";

  try {
    // Create a temporary 404 record
    const testError = await prisma.error404.create({
      data: {
        websiteId: 1,
        url: testUrl,
        sourceUrl: testUrl,
        status: "404",
      },
    });

    console.log("Created test 404:");
    console.dir(testError, { depth: 3 });

    const crawler = createCrawler(
      "https://example.com",
      1,
      prisma
    );

    const result = await crawler.checkUrlFor404(
      testUrl,
      "https://example.com"
    );

    console.log("\nRecovery test result:");
    console.dir(result, { depth: 3 });

    const updatedError = await prisma.error404.findUnique({
      where: {
        id: testError.id,
      },
    });

    console.log("\nDatabase record after test:");
    console.dir(updatedError, { depth: 3 });
  } catch (error) {
    console.error("Recovery test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testRecovery();
