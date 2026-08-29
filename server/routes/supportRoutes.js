const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !subject.trim()) {
    return res.status(400).json({
      message: "Subject is required",
    });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user.userId,
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create support ticket",
    });
  }
});

module.exports = router;
