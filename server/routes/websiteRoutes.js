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

router.get("/:id", authMiddleware, async (req, res) => {
  const websiteId = Number(req.params.id);

  if (!Number.isInteger(websiteId)) {
    return res.status(400).json({
      message: "Invalid website ID",
    });
  }

  try {
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: req.user.userId,
      },
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found",
      });
    }

    res.status(200).json({
      website,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch website",
    });
  }
});

router.patch("/:id/monitoring", authMiddleware, async (req, res) => {
  const websiteId = Number(req.params.id);
  const { monitoringEnabled } = req.body;

  if (!Number.isInteger(websiteId)) {
    return res.status(400).json({
      message: "Invalid website ID",
    });
  }

  if (typeof monitoringEnabled !== "boolean") {
    return res.status(400).json({
      message: "monitoringEnabled must be a boolean",
    });
  }

  try {
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: req.user.userId,
      },
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found",
      });
    }

    const updatedWebsite = await prisma.website.update({
      where: {
        id: websiteId,
      },
      data: {
        monitoringEnabled,
      },
    });

    res.status(200).json({
      message: "Monitoring status updated successfully",
      website: updatedWebsite,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update monitoring status",
    });
  }
});

router.patch("/:id/monitoring/resume", authMiddleware, async (req, res) => {
  const websiteId = Number(req.params.id);

  if (!Number.isInteger(websiteId)) {
    return res.status(400).json({
      message: "Invalid website ID",
    });
  }

  try {
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: req.user.userId,
      },
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found",
      });
    }

    const updatedWebsite = await prisma.website.update({
      where: {
        id: websiteId,
      },
      data: {
        monitoringEnabled: true,
      },
    });

    res.status(200).json({
      message: "Monitoring resumed successfully",
      website: updatedWebsite,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to resume monitoring",
    });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const websiteId = Number(req.params.id);

  if (!Number.isInteger(websiteId)) {
    return res.status(400).json({
      message: "Invalid website ID",
    });
  }

  try {
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: req.user.userId,
      },
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found",
      });
    }

    await prisma.website.delete({
      where: {
        id: websiteId,
      },
    });

    res.status(200).json({
      message: "Website deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete website",
    });
  }
});

module.exports = router;