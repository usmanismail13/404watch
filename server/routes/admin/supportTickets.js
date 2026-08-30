const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("🆘 ADMIN SUPPORT TICKETS:");
    console.log(tickets);

    res.status(200).json({
      tickets,
    });
  } catch (error) {
    console.error("❌ Failed to load support tickets:", error);

    res.status(500).json({
      message: "Failed to load support tickets",
    });
  }
});

module.exports = router;
