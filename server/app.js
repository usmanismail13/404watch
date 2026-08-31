require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const { send404Alert } = require("./services/emailService");

const app = express();

// ==================== SECURITY ====================

// 🛡️ Security headers
app.use(
  helmet({
    hsts: process.env.NODE_ENV === "production",
  })
);


// 🌐 Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
];

// 🌐 CORS protection
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as health checks or server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

// 🔐 CSRF protection
const csrfProtection = (req, res, next) => {
  // Safe HTTP methods do not modify application state.
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Allow requests without Origin headers.
  // These can include server-to-server requests,
  // CLI tools, health checks, and other non-browser clients.
  if (!req.headers.origin) {
    return next();
  }

  // Reject requests from unknown browser origins.
  if (!allowedOrigins.includes(req.headers.origin)) {
    return res.status(403).json({
      success: false,
      message: "CSRF protection: origin not allowed",
    });
  }

  next();
};

app.use(csrfProtection);

// ==================== REQUEST PARSING ====================

// 📦 Parse JSON request bodies
app.use(
  express.json({
    limit: "10kb",
  })
);

// 🍪 Parse cookies
app.use(cookieParser());

// ==================== RATE LIMITING ====================

// 🚦 API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // 100 requests per IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// ==================== ROUTES ====================

// 🔐 Authentication routes
const authRoutes = require("./routes/authRoutes");

// 🌐 Website routes
const websiteRoutes = require("./routes/websiteRoutes");

// 🚨 Error routes
const errorRoutes = require("./routes/errorRoutes");

// 🔍 Scan routes
const scanRoutes = require("./routes/scanRoutes");

// 📊 Dashboard routes
const dashboardRoutes = require("./routes/dashboard.routes");

// 🆘 Support routes
const supportRoutes = require("./routes/supportRoutes");

// 👨‍💼 Admin support-ticket routes
const adminSupportTicketsRoutes = require("./routes/admin/supportTickets");

// 🛣️ API routes
app.use("/api/auth", authRoutes);
app.use("/api/websites", websiteRoutes);
app.use("/api/errors", errorRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin/support-tickets", adminSupportTicketsRoutes);

// ==================== HEALTH CHECK ====================

// ❤️ Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
  });
});

// ==================== PROTECTED TEST ROUTE ====================

// 🔐 Authentication middleware
const authMiddleware = require("./middleware/authMiddleware");

// 🔒 Protected test endpoint
app.get("/api/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You are authenticated",
    user: req.user,
  });
});

// ==================== EMAIL TEST ====================

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

// ==================== GLOBAL ERROR HANDLER ====================

// ❌ Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;
