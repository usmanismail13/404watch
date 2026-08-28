const express = require("express");

const { PrismaClient } = require("../generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const router = express.Router();

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

router.get("/stats", async (req, res) => {
  try {
    const totalErrors = await prisma.error404.count();

    const activeErrors = await prisma.error404.count({
      where: {
        status: "404",
      },
    });

    const recoveredErrors = await prisma.error404.count({
      where: {
        recoveredAt: {
          not: null,
        },
      },
    });

    const lastScan = await prisma.scan.findFirst({
      where: {
        status: "completed",
        completedAt: {
          not: null,
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      select: {
        completedAt: true,
      },
    });

    res.json({
      totalErrors,
      activeErrors,
      recoveredErrors,
      lastScan: lastScan?.completedAt || null,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      message: "Failed to load dashboard statistics",
    });
  }
});

module.exports = router;
