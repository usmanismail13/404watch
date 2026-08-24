const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const errors = await prisma.error404.findMany({
      where: {
        website: {
          userId: req.user.userId,
        },
      },
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
    });

    res.status(200).json({
      errors,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch 404 errors",
    });
  }
});

module.exports = router;