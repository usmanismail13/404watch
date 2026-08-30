const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const {
  sendSupportTicketNotification,
} = require("../services/emailService");

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
    // Create the support ticket first so PostgreSQL
    // gives us its unique numeric ID.
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketId: "TEMP",
        userId: req.user.userId,
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    // Generate a human-friendly ticket ID.
    const ticketId = `TKT-${String(ticket.id).padStart(6, "0")}`;

    // Update the ticket with the generated ticket ID.
    const updatedTicket = await prisma.supportTicket.update({
      where: {
        id: ticket.id,
      },
      data: {
        ticketId,
      },
    });

    // Send support-ticket notification email.
    try {
      await sendSupportTicketNotification({
        ticketId: updatedTicket.ticketId,
        customerEmail: req.user.email,
        subject: updatedTicket.subject,
        message: updatedTicket.message,
      });
    } catch (emailError) {
      console.error(
        "Failed to send support ticket notification email:",
        emailError
      );
    }

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create support ticket",
    });
  }
});

module.exports = router;
