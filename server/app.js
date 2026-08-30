require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { send404Alert } = require("./services/emailService");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

const authRoutes = require("./routes/authRoutes");
const websiteRoutes = require("./routes/websiteRoutes");
const errorRoutes = require("./routes/errorRoutes");
const scanRoutes = require("./routes/scanRoutes");
const dashboardRoutes = require("./routes/dashboard.routes");
const supportRoutes = require("./routes/supportRoutes");
const adminSupportTicketsRoutes = require("./routes/admin/supportTickets");

app.use("/api/auth", authRoutes);
app.use("/api/websites", websiteRoutes);
app.use("/api/errors", errorRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin/support-tickets", adminSupportTicketsRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const authMiddleware = require("./middleware/authMiddleware");

app.get("/api/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You are authenticated",
    user: req.user,
  });
});

// 🧪 Temporary 404 email test endpoint
app.get("/api/test/404-email", async (req, res) => {
  try {
    await send404Alert({
      to: process.env.TEST_EMAIL_TO,
      brokenUrl: "https://example.com/missing-page",
      sourcePage: "https://example.com/",
      detectedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Test 404 email sent",
    });
  } catch (error) {
    console.error("Test 404 email failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send 404 email",
    });
  }
});

module.exports = app;
