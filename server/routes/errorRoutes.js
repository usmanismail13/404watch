const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

  const offset = (page - 1) * limit;

  try {
    const where = {
      website: {
        userId: req.user.userId,
      },
    };

    const errors = await prisma.error404.findMany({
      where,
      include: {
        website: {
          select: {
            id: true,
            url: true,
          },
        },
      },
      orderBy: {
        detectedAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.error404.count({
      where,
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      errors,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch 404 errors",
    });
  }
});

module.exports = router;
