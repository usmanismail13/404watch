const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const validateUrl = require("../utils/validateUrl");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      message: "Website URL is required",
    });
  }

  const normalizedUrl = validateUrl(url);

  if (!normalizedUrl) {
    return res.status(400).json({
      message: "Invalid website URL",
    });
  }

  try {
    const website = await prisma.website.create({
      data: {
        userId: req.user.userId,
        url: normalizedUrl,
      },
    });

    res.status(201).json({
      message: "Website added successfully",
      website,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add website",
    });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const websites = await prisma.website.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      websites,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch websites",
    });
  }
});

module.exports = router;