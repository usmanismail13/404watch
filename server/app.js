const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

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

app.use("/api/auth", authRoutes);
app.use("/api/websites", websiteRoutes);

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

module.exports = app;