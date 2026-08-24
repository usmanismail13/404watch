const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      message: "Website URL is required",
    });
  }

  try {
    const website = await prisma.website.create({
      data: {
        userId: req.user.userId,
        url,
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

module.exports = router;