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

router.patch("/:ticketId/pending", authMiddleware, async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: {
        ticketId,
      },
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: {
        ticketId,
      },
      data: {
        status: "pending",
      },
    });

    console.log(`🟡 Ticket ${ticketId} marked as pending`);

    res.status(200).json({
      message: "Support ticket marked as pending",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("❌ Failed to mark ticket as pending:", error);

    res.status(500).json({
      message: "Failed to update support ticket",
    });
  }
});

module.exports = router;
